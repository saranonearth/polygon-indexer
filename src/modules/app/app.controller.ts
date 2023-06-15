import {Controller, Get, Req, UseGuards} from '@nestjs/common';
import {AppService} from './app.service';
import {ApiBearerAuth, ApiResponse} from '@nestjs/swagger';
import {AuthGuard} from '@nestjs/passport';
import {Request} from 'express';

/**
 * App Controller
 */
@Controller()
@ApiBearerAuth()
export class AppController {
    /**
     * Constructor
     * @param appService
     */
    constructor(private readonly appService: AppService) {
    }

    /**
     * Returns the an environment variable from config file
     * @returns {string} the application environment url
     */
    @Get()
    @ApiResponse({status: 200, description: 'Request Received'})
    @ApiResponse({status: 400, description: 'Request Failed'})
    public getString(): string {
        return this.appService.root();
    }
}
