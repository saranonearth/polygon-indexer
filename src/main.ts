import headers from 'fastify-helmet';

import {NestFactory} from '@nestjs/core';
import {RequestMethod, ValidationPipe} from '@nestjs/common';
import {FastifyAdapter, NestFastifyApplication} from '@nestjs/platform-fastify';

import {AppModule} from './modules/app/app.module';
// tslint:disable-next-line:no-var-requires
const rotatingLogStream = require('file-stream-rotator').getStream(
    {
        filename: '/var/log/nodejs/http-access-%DATE%.log',
        frequency: 'daily',
        verbose: false,
        date_format: 'YYYY-MM-DD',
        max_logs: '10d'
    });

(async () => {
    const app = await NestFactory.create<NestFastifyApplication>(
        AppModule,
        new FastifyAdapter({
            logger: {
                stream: rotatingLogStream
            }
        })
    );
    app.enableCors();
    app.register(headers);
    app.useGlobalPipes(new ValidationPipe());
    app.setGlobalPrefix(process.env.ROUTE_PREFIX || '', {
        exclude: [{path: '/', method: RequestMethod.GET}]
    });
    console.log('PORT', process.env.PORT);
    await app.listen(process.env.PORT || 9000, '0.0.0.0');
})();
