import {Module} from '@nestjs/common';
import {WebSocketModule, WebSocketModuleOptions} from 'nestjs-websocket';
import {ConfigService} from '@nestjs/config';
import * as providers from './providers';
import {ProducerModule} from '../producer/producer.module';
import {MongooseModule} from '@nestjs/mongoose';
import {Transaction, TransactionSchema} from './models/Transaction';
import {StoreTransactionTask} from './tasks/store.transaction.task';

@Module({
    imports: [ProducerModule, MongooseModule.forFeature([
        {name: Transaction.name, schema: TransactionSchema, collection: 'transactions'}
    ]), WebSocketModule.forRootAsync({
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => {
            return {
                url: configService.get('POLYGON_RPC_WSS')
            } as WebSocketModuleOptions;
        }
    })],
    providers: [...Object.values(providers), StoreTransactionTask],
    exports: []
})
export class IndexerModule {
}
