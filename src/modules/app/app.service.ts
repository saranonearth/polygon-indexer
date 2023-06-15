import {Inject, Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {Logger} from 'winston';
import {format} from 'date-fns';

/**
 * Application Service
 */
@Injectable()
export class AppService {
    /**
     * Constructor
     * @param {ConfigService} config configuration service
     * @param {Logger} logger logger service
     */
    constructor(
        private config: ConfigService,
        @Inject('winston') private readonly logger: Logger
    ) {
    }

    /**
     * Fetches and logs the APP_URL environment variable from the configuration file.
     * @returns {string} the application url
     */
    public root(): any {
        return {
            org: 'polygon pos',
            service: 'pos-indexer',
            status: 'running',
            now: format(new Date(), 'dd/MM/yyyy HH:mm:ss')
        };
    }
}
