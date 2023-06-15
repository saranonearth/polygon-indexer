export type EventType = {
    event: string[]
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

export interface RPCResponse<T> {
    jsonrpc: string;
    id: number;
    result: T;
}

export interface TransactionByHashResponse {
    blockHash: string;
    blockNumber: string;
    hash: string;
    from: string;
    gas: string;
    gasPrice: string;
    input: string;
    nonce: string;
    r: string;
    s: string;
    to: string;
    transactionIndex: string;
    type: string;
    v: string;
    value: string;
};

export interface TransactionReceipt {
    transactionHash: string;
    blockHash: string;
    blockNumber: string;
    logs: Log[];
    contractAddress: any;
    effectiveGasPrice: string;
    cumulativeGasUsed: string;
    from: string;
    gasUsed: string;
    logsBloom: string;
    status: string;
    to: string;
    transactionIndex: string;
    type: string;
}

export interface Log {
    transactionHash: string;
    address: string;
    blockHash: string;
    blockNumber: string;
    data: string;
    logIndex: string;
    removed: boolean;
    topics: string[];
    transactionIndex: string;
}
