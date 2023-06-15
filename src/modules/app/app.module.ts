import * as winston from 'winston';
import rotateFile from 'winston-daily-rotate-file';

import {Module} from '@nestjs/common';
import {MongooseModule, MongooseModuleAsyncOptions} from '@nestjs/mongoose';
import {ScheduleModule} from '@nestjs/schedule';

import {ConfigModule} from '@nestjs/config';
import {ConfigService} from '@nestjs/config';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {format} from 'winston';
import {KafkaModule, KafkaModuleOption} from '@rob3000/nestjs-kafka';
import {WinstonModule} from '../winston/winston.module';
import {ConsumerModule} from '../consumer/consumer.module';
import {EventEmitterModule} from '@nestjs/event-emitter';
import {ProducerModule} from '../producer/producer.module';
import {IndexerModule} from '../indexer/indexer.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true
        }),
        EventEmitterModule.forRoot({
            wildcard: true
        }),
        MongooseModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) =>
                ({
                    uri: configService.get('MONGO_URL'),
                    connectionName: 'ratesDB',
                    useNewUrlParser: true,
                    useUnifiedTopology: true,
                    serverSelectionTimeoutMS: 30000
                } as MongooseModuleAsyncOptions)
        }),
        WinstonModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                return configService.get('APP_ENV') === 'development'
                    ? {
                        level: 'info',
                        format: winston.format.json(),
                        defaultMeta: {service: 'pos-indexer-development'},
                        transports: [
                            new winston.transports.Console({
                                format: winston.format.simple()
                            })
                        ]
                    }
                    : {
                        level: 'debug',
                        format: format.combine(format.timestamp(), format.splat(), format.json()),
                        defaultMeta: {service: 'pos-indexer' + configService.get('APP_ENV')},
                        transports: [
                            ...configService.get('APP_ENV') === 'local' ? [
                                new winston.transports.Console({
                                    level: 'info',
                                    format: winston.format.combine(winston.format.colorize(), winston.format.simple())
                                })
                            ] : [],
                            new rotateFile({
                                dirname: '/var/log/nodejs',
                                filename: 'application-%DATE%.log',
                                datePattern: 'YYYY-MM-DD',
                                zippedArchive: true,
                                maxSize: '20m',
                                maxFiles: '7d',
                                createSymlink: true,
                                symlinkName: 'application.log'
                            })
                        ]
                    };
            }
        }),
        KafkaModule.registerAsync(['POS_INDEXER'], {
            useFactory: (configService: ConfigService) => {
                const brokers = configService.get('KAFKA_BROKERS') .split(',');
                return [
                    {
                        name: 'POS_INDEXER',
                        options: {
                            client: {
                                clientId: 'pos-indexer' + configService.get('APP_ENV'),
                                brokers,
                                ssl: false
                            },
                            consumer: {
                                groupId: 'pos-indexer-consumer-' + configService.get('APP_ENV'),
                                allowAutoTopicCreation: true
                            }
                        }
                    }] as KafkaModuleOption[];
            },
            inject: [ConfigService]
        }),
        ScheduleModule.forRoot(),
        ConsumerModule,
        ProducerModule,
        IndexerModule
    ],
    controllers: [AppController],
    providers: [AppService]
})
export class AppModule {
}
