
### Polygon(POS) Indexer
<img width="889" alt="Screenshot 2023-06-16 at 3 47 38 AM" src="https://github.com/saranonearth/polygon-indexer/assets/44068102/76f9fd56-dce7-4672-9a43-8cbb8d2360c5">

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


