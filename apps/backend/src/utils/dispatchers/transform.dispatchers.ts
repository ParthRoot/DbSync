import { NestInterceptor, ExecutionContext, CallHandler, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Success response schema
 */
export interface Response<T> {
    data: T;
    message: string;
    is_error: boolean;
}

/**
 * Response transformer
 * Transforms object to valid json response
 */
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
    intercept(_context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
        return next.handle().pipe(
            map((result) => ({
                is_error: false,
                message: result?.message || '',
                data: result?.data || {},
            })),
        );
    }
}
