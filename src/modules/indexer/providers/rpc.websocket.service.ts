import {Inject, Injectable} from '@nestjs/common';
import {InjectWebSocketProvider, OnClose, OnError, OnMessage, OnOpen, WebSocketClient} from 'nestjs-websocket';
import {Logger} from 'winston';
import {UtilsService} from './utils.service';

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
            // listening to newPending transactions that are added to mempool
            await this.ws.send(JSON.stringify({'jsonrpc': '2.0', 'id': 2, 'method': 'eth_subscribe', 'params': ['alchemy_pendingTransactions']}));
            // listening to mined transactions
            await this.ws.send(JSON.stringify({'jsonrpc': '2.0', 'id': 2, 'method': 'eth_subscribe', 'params': ['alchemy_minedTransactions']}));
            this.logger.info('Polygon(POS) websocket onOpen');
        } catch (e) {
            this.logger.error('ws open', e);
        }
    }

    @OnMessage()
    public async onMessage(message: WebSocketClient.Data): Promise<void> {
        try {
            if (!message) { return; }
            const data = JSON.parse(message);
            // If the message is from listening to newPendingTransaction event (mempool)
            if (data?.params?.result?.blockHash === null) {
                await this.utilsService.handleQueuedTransaction(data);
                return;
            }
            // Else then the message is from minedTransaction event
            await this.utilsService.processMinedTransaction(data);
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
