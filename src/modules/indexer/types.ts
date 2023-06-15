export type EventType = {
    event: string
    data: any
};

export type NewPendingTransaction = Socket<NewPendingTransactionType>;

export interface Socket<T> {
    jsonrpc: string;
    method: string;
    params: T;
}

export type NewPendingTransactionType = {
    result: {
        blockHash: string | null,
        blockNumber: string | null,
        from: string,
        gas: string,
        gasPrice: string,
        hash: string,
        input: string,
        nonce: string,
        to: string,
        transactionIndex: string | null,
        value: string,
        type: string,
        v: string,
        r: string,
        s: string
    },
    subscription: string
};
