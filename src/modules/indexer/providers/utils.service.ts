import {Inject, Injectable} from '@nestjs/common';
import {Logger} from 'winston';
import {EventType, NewPendingTransaction} from '../types';
import {ProducerService} from '../../producer/providers';

@Injectable()
export class UtilsService{
    constructor(
        private readonly producerService: ProducerService,
        @Inject('winston') private readonly logger: Logger
    ) {
    }

    public async produceQueuedTransaction(data: NewPendingTransaction): Promise<void> {
        if (data.method !== 'eth_subscription') { return; }
        const eventItem: EventType = {
            event: 'event.store.transaction',
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
}
