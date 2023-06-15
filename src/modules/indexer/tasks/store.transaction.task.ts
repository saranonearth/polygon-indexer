import {OnEvent} from '@nestjs/event-emitter';
import {Inject} from '@nestjs/common';
import {Transaction} from '../models/Transaction';
import {Logger} from 'winston';
import {TransactionDataService} from '../providers/transaction.data.service';

export class StoreTransactionTask {
    constructor(
        private readonly transactionDataService: TransactionDataService,
        @Inject('winston') private readonly logger: Logger
    ) {}

    @OnEvent('event.store.transaction', {async: true})
    public async process(task: any): Promise<void> {
        try {
            if (!task) {
                throw new Error('Event task data not found');
            }
            const tx = new Transaction();
            tx.transactionHash = task.transactionHash;
            tx.status = task.status;
            tx.emittedAt = new Date();
            tx.data = task.data;
            await this.transactionDataService.saveEvent(tx);
            this.logger.info(`EventCreateTask - finished processing:${task.eventId}`, {task});
        } catch (error) {
            this.logger.error(`Error in EventCreateTask:${task?.eventId}`, error);
        }
    }
}
