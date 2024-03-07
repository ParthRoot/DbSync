import {
    ArgumentsHost,
    BadRequestException,
    Catch,
    ConflictException,
    ExceptionFilter,
    ForbiddenException,
    HttpException,
    HttpStatus,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { UnautherizationError } from '../error/unauthorization.error';
import { logger } from '../log.util';
import { ApiException } from '../error';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    /**
     * It will use as a global catcher for the whole project.
     * @param exception unknown
     * @param host ArgumentsHost
     */
    // eslint-disable-next-line max-lines-per-function
    catch(exception: Error, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        let message = exception.message ?? 'Unknown error';
        let code = 'HttpException';

        logger.error(message, (exception as any).stack, `${request.method} ${request.url}`);

        let status = HttpStatus.INTERNAL_SERVER_ERROR;

        switch (exception.constructor) {
            case UnautherizationError:
                status = (exception as UnautherizationError).getStatus();
                message = (exception as UnautherizationError).message;
                code = (exception as any).code;
                break;
            case HttpException:
                status = (exception as HttpException).getStatus();
                break;
            case BadRequestException:
                status = HttpStatus.BAD_REQUEST;
                message = (exception as BadRequestException).message;
                code = (exception as any).code;
                break;
            case Error:
                status = HttpStatus.BAD_REQUEST;
                message = exception.message;
                code = (exception as any).code;
                break;
            case UnauthorizedException:
                status = HttpStatus.UNAUTHORIZED;
                message = (exception as UnauthorizedException).message;
                code = (exception as any).code;
                break;
            case NotFoundException:
                status = HttpStatus.NOT_FOUND;
                message = (exception as NotFoundException).message;
                code = (exception as any).code;
                break;
            case TypeError:
                status = HttpStatus.CONFLICT;
                message = (exception as TypeError).message;
                code = (exception as any).code;
                break;
            case ConflictException: // Handle ConflictException
                status = HttpStatus.CONFLICT;
                message = (exception as ConflictException).message;
                code = (exception as any).code;
                break;
            case ForbiddenException:
                status = (exception as ForbiddenException).getStatus();
                message = (exception as ForbiddenException).message;
                code = (exception as any).code;
                break;
            case ApiException:
                status = (exception as ApiException).getStatus();
                message = (exception as ApiException).message;
                code = (exception as any).code;
                break;
        }

        logger.error({
            statusCode: status,
            message,
            code,
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
            exception: exception,
        });

        response.status(status).json({
            isError: true,
            message: message,
            data: null,
        });
    }
}
