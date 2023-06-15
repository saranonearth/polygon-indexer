import {TransactionDataService, UtilsService} from '../providers';
import {Inject} from '@nestjs/common';
import {Logger} from 'winston';
import { Cron } from '@nestjs/schedule';

export class TransactionSchedulerTask {

    constructor(
        private readonly utilService: UtilsService,
        private readonly transactionDataService: TransactionDataService,
        @Inject('winston') private readonly logger: Logger
    ) {}

    /**
     * Batch Processing scheduler job fetches all the QUEUED transactions every 1 min
     * and re-process them to move their status to CONFIRMED, FAILED or CANCELLED
     */
    @Cron('*/1 * * * * *')
    public async QueuedTxScheduler(): Promise<void> {
       try {
            let batch = 0;
            const size = 100;
            while (true) {
                const transactions = await this.transactionDataService.getTransactionsByStatus('QUEUED', batch, size);
                if (transactions.length === 0) {
                    break;
                }
                batch = batch + size;
                for (const tx of transactions) {
                    await this.utilService.processTransaction(tx.transactionHash, tx.data);
                }
            }
       } catch (error) {
           this.logger.error('Error in QueuedTxScheduler', error);
       }
    }

}
