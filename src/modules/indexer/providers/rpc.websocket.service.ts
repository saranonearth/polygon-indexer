import {Inject, Injectable} from '@nestjs/common';
import {InjectWebSocketProvider, OnClose, OnError, OnMessage, OnOpen, WebSocketClient} from 'nestjs-websocket';
import {Logger} from 'winston';
import {NewPendingTransaction} from '../types';
import {UtilsService} from './utils.service';
import {eth_subscribe_newPendingTxs} from '../constants';

@Injectable()
export class RpcWebsocketService {

    constructor(
        private readonly utilsService: UtilsService,
        @InjectWebSocketProvider() private readonly ws: WebSocketClient,
        @Inject('winston') private readonly logger: Logger
    ) {
    }

    @OnOpen()
    public async open(): Promise<void> {
        try {
            // listening to newPending transaction that are added to mempool
            const resp = await this.ws.send(JSON.stringify({'jsonrpc': '2.0', 'id': 2, 'method': 'eth_subscribe', 'params': ['alchemy_pendingTransactions']}));
            this.logger.info('Polygon(POS) websocket onOpen', {resp});
        } catch (e) {
            this.logger.error('ws open', e);
        }
    }

    @OnMessage()
    public async onMessage(message: WebSocketClient.Data): Promise<void> {
        try {
            if (!message) { return; }
            const data = JSON.parse(message);
            await this.utilsService.produceQueuedTransaction(data);
        } catch (e) {
            this.logger.error('onMessage', e, {data: JSON.parse(message)});
        }
    }

    @OnError()
    public async onError(err: any): Promise<void> {
        this.logger.error('indexer.websocket.service - onError', {err});
    }

    @OnClose()
    public async onClose(code: number, reason: string): Promise<void> {
        this.logger.info('Socket Closed');
        if (code === 1000 || code === 1006) {
            await this.open();
        }
    }

}
