import {Inject, Injectable} from '@nestjs/common';
import {EventEmitter2} from '@nestjs/event-emitter';
import {IHeaders, KafkaService, SubscribeTo} from '@rob3000/nestjs-kafka';
import {Logger} from 'winston';
import {EventType} from '../indexer/types';

@Injectable()
export class ConsumerService {
    constructor(
        private readonly eventEmitter: EventEmitter2,
        @Inject('POS_INDEXER') private client: KafkaService,
        @Inject('winston') private readonly logger: Logger
    ) {
    }

    public onModuleInit(): void {
        this.client.subscribeToResponseOf('event.transactions', this);
    }

    @SubscribeTo('event.transactions')
    public async process(data: any, key: any, offset: number, timestamp: number, partition: number, headers: IHeaders): Promise<void> {
        try {
            const parsedData: EventType = JSON.parse(data);
            for (const event of parsedData.event) {
                await this.eventEmitter.emitAsync(event, parsedData.data);
            }
        } catch (error) {
            this.logger.error('Consumer Error', error, {data});
        }
    }
}
