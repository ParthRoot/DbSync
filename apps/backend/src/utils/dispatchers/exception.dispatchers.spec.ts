import { GlobalExceptionFilter } from './exception.dispatchers';
import * as httpMock from 'node-mocks-http';
import { UnautherizationError } from '../error';
import {
    BadRequestException,
    ConflictException,
    HttpException,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';

describe('Exception handler', () => {
    const exc = new GlobalExceptionFilter();
    const host = {
        switchToHttp: jest.fn().mockReturnThis(),
        getRequest: () => httpMock.createRequest(),
        getResponse: () => httpMock.createResponse(),
    };

    it('[CATCH] : UnautherizationError', async () => {
        exc.catch(new UnautherizationError('User not authorizesd'), host as any);
    });

    it('[CATCH] : HttpException', async () => {
        exc.catch(new HttpException('bad', 500), host as any);
    });

    it('[CATCH] : BadRequestException', async () => {
        exc.catch(new BadRequestException(), host as any);
    });

    it('[CATCH] : Error', async () => {
        exc.catch(new Error(), host as any);
    });

    it('[CATCH] : UnauthorizedException', async () => {
        exc.catch(new UnauthorizedException(), host as any);
    });

    it('[CATCH] : UnauthorizedException', async () => {
        exc.catch(new NotFoundException(), host as any);
    });

    it('[CATCH] : TypeError', async () => {
        exc.catch(new TypeError(), host as any);
    });

    it('[CATCH] : ConflictException', async () => {
        exc.catch(new ConflictException(), host as any);
    });

    it('[CATCH] : error message undefined', async () => {
        let err = new Error(undefined);
        exc.catch({ ...err }, host as any);
    });
});
