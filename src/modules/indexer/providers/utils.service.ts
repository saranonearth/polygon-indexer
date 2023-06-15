import {Inject, Injectable} from '@nestjs/common';
import {Logger} from 'winston';
import {EventType, NewPendingTransaction, RPCResponse, TransactionByHashResponse, TransactionReceipt} from '../types';
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
}
