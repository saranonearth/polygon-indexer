import {Inject, Injectable} from '@nestjs/common';
import {KafkaService} from '@rob3000/nestjs-kafka';
import {Logger} from 'winston';
import {KafkaMessageSend} from '@rob3000/nestjs-kafka/dist/interfaces';

@Injectable()
export class ProducerService {

    constructor(
        @Inject('POS_INDEXER') private client: KafkaService,
        @Inject('winston') private readonly logger: Logger
    ) {
    }

    public async publishMessage(message: KafkaMessageSend): Promise<void> {
        this.logger.debug('Publishing kafka message', {topic: message.topic, messages: message.messages});
        await this.client.send(message);
        return;
    }

}
