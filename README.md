
### Polygon(POS) Indexer
A transaction indexer for Polygon(POS)💜

<img width="889" alt="Screenshot 2023-06-16 at 3 47 38 AM" src="https://github.com/saranonearth/polygon-indexer/assets/44068102/76f9fd56-dce7-4672-9a43-8cbb8d2360c5">

## How does it work?
The indexer subscribes to newPendingTransaction and minedTransaction events of the node and process these events to identify their life cycle states - Queued, Pending, Confirmed, Failed, Cancelled.

## How are states identified

### Queued
Every transaction that enters the indexer via newPendingTransaction subscription are transactions added to the network to mempool. These are marked as Queued and stored in DB.

### Pending
Using transaction hash in the transaction processing module we fetch <code>getTransactionByHash</code> and <code>transactionReceipt</code>. If  <code>getTransactionByHash</code> reponse gives a null block number or <code>transactionReceipt</code> result is null then the transaction is picked up but not yet mined - Pending state

### Cancelled
If the <code>getTransactionByHash</code> result is null, the transaction is unknown - Cancelled state.

### Failed
If the <code>transactionReceipt</code> result status is **0x0** then the transaction is in Failed state.

### Confirmed
If the <code>transactionReceipt</code> result status is anything other than **0x0** then the transaction is in Confirmed state.

## Local Setup 
- Without Docker
```
npm install
npm run start:dev
```
- Using Docker
```
docker build -t polygon-indexer:latest .
docker run -p 9000:9000 polygon-indexer:latest
```

> Note: Run docker-compose up --build to setup kafka

## Env
Following variables need to be added to the .env file
```
APP_ENV="development"
KAFKA_BROKERS=localhost:29092
MONGO_URL=
POLYGON_RPC_WSS=
POLYGON_RPC=
PORT=9000
```

## Contributing
If you'd like to contribute, please fork the repository and use a feature branch. Pull requests are warmly welcome.

## License
This is free software under the terms of the MIT license 


