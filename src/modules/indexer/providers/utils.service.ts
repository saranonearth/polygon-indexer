import {Inject, Injectable} from '@nestjs/common';
import {Logger} from 'winston';
import {EventType, MinedTransaction, NewPendingTransaction, RPCResponse, TransactionByHashResponse, TransactionReceipt} from '../types';
import {ProducerService} from '../../producer/providers';
import axios from 'axios';
import {ConfigService} from '@nestjs/config';
import {TxStatus} from '../models/Transaction';

@Injectable()
export class UtilsService {
    constructor(
        readonly configureService: ConfigService,
        private readonly producerService: ProducerService,
        @Inject('winston') private readonly logger: Logger
    ) {
    }

    /**
     * Fetch transactionReceipt and validate to check if the
     * transaction is CANCELLED or CONFIRMED
     * @param data
     */
    public async processMinedTransaction(data: MinedTransaction): Promise<void> {
        if (data?.method !== 'eth_subscription') { return; }
        const hash = data?.params?.result?.transaction?.hash;
        try {
            const txReceipt = await this.getTransactionReceipt(hash);
            if (!txReceipt.result.blockNumber) {
                this.logger.info('In processTransaction - Transaction not mined yet');
                return;
            }
            /**
             * At this point of execution flow we know transaction is mined,
             * check if status is 0x0 or not and we decide if transaction
             * was CONFIRMED or FAILED
             */
            if (txReceipt.result.status === '0x0') {
                await this.storeTransaction('CANCELLED', hash, data);
                return;
            }
            await this.storeTransaction('CONFIRMED', hash, data);
        } catch (error) {
            this.logger.error('Error in handleMinedTransaction', error, {hash});
        }
    }

    public async handleQueuedTransaction(data: NewPendingTransaction): Promise<void> {
        if (data.method !== 'eth_subscription') { return; }
        const eventItem: EventType = {
            event: ['event.store.transaction', 'event.process.transaction'],
            data: {
                status: 'QUEUED',
                transactionHash: data.params.result.hash,
                data
            }
        };
        return await this.producerService.publishMessage({
            topic: 'event.transactions',
            messages: [
                {
                    key: 'tx' + '_' + data.params.result.hash,
                    value: JSON.stringify(eventItem)
                }
            ]
        });
    }

    public async storeTransaction(status: TxStatus, hash: string, data: any): Promise<void> {
        if (data.method !== 'eth_subscription') { return; }
        const eventItem: EventType = {
            event: ['event.store.transaction'],
            data: {
                status,
                transactionHash: hash,
                data
            }
        };
        return await this.producerService.publishMessage({
            topic: 'event.transactions',
            messages: [
                {
                    key: 'tx' + '_' + hash,
                    value: JSON.stringify(eventItem)
                }
            ]
        });
    }

    public async processTransaction(hash: string, data: any): Promise<void> {
        if (data.method !== 'eth_subscription') { return; }
        const eventItem: EventType = {
            event: ['event.process.transaction'],
            data: {
                transactionHash: hash,
                data
            }
        };
        return await this.producerService.publishMessage({
            topic: 'event.transactions',
            messages: [
                {
                    key: 'tx' + '_' + hash,
                    value: JSON.stringify(eventItem)
                }
            ]
        });
    }

    public async getTransactionByHash(hash: string): Promise<RPCResponse<TransactionByHashResponse>> {
        const response = await axios.post(
            this.configureService.get('POLYGON_RPC') as string,
            {
                'jsonrpc': '2.0',
                'method': 'eth_getTransactionByHash',
                'params': [hash],
                'id': 1
            },
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    }

    public async getTransactionReceipt(hash: string): Promise<RPCResponse<TransactionReceipt>> {
        const response = await axios.post(
            this.configureService.get('POLYGON_RPC') as string,
            {
                'jsonrpc': '2.0',
                'method': 'eth_getTransactionReceipt',
                'params': [hash],
                'id': 1
            },
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    }

}
