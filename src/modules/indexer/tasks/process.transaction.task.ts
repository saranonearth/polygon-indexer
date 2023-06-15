import {Inject} from '@nestjs/common';
import {Logger} from 'winston';
import {TransactionDataService, UtilsService} from '../providers';
import {OnEvent} from '@nestjs/event-emitter';
import {RPCResponse, TransactionByHashResponse, TransactionReceipt} from '../types';

export class ProcessTransactionTask {
    constructor(
        private readonly utilService: UtilsService,
        private readonly transactionDataService: TransactionDataService,
        @Inject('winston') private readonly logger: Logger
    ) {
    }

    /**
     * Use eth_getTransactionByHash and eth_getTransactionReceipt to
     * check if transaction status needs to move from QUEUED to other
     * @param task
     */
    @OnEvent('event.process.transaction', {async: true})
    public async processTransactionInMempool(task: any): Promise<void> {
        try {
            if (!task) {
                throw new Error('event.process.transaction - Event task data not found');
            }
            const results = await Promise.all([
                this.utilService.getTransactionByHash(task.transactionHash),
                this.utilService.getTransactionReceipt(task.transactionHash)
                ]);
            const transaction = results[0] as RPCResponse<TransactionByHashResponse>;
            const TxReceipt = results[1] as RPCResponse<TransactionReceipt>;

            // If transactions is null then the transaction is unknown (CANCELLED)
            if (!transaction) {
                await this.utilService.storeTransaction('CANCELLED', task.transactionHash, task);
                return;
            }
            // If block number is null or receipt is null
            // then the transaction is picked up but not yet mined(PENDING)
            if (!transaction.result.blockNumber || !TxReceipt.result) {
                await this.utilService.storeTransaction('PENDING', task.transactionHash, task);
                return;
            }
            // Tx is mined but the transaction failed
            if (TxReceipt.result.blockNumber && TxReceipt.result.status === '0x0') {
                await this.utilService.storeTransaction('FAILED', task.transactionHash, TxReceipt);
                return;
            }
            // Tx is mined but the transaction confirmed
            if (TxReceipt.result.blockNumber && TxReceipt.result.status !== '0x0') {
                await this.utilService.storeTransaction('CONFIRMED', task.transactionHash, TxReceipt);
                return;
            }

        } catch (error) {
            this.logger.error(`Error in processTransactionInMempool:`, error);
        }
}
}
