import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { TransformInterceptor } from './transform.dispatchers';
import { Observable, of } from 'rxjs';

describe('Transform dispatcher', () => {
    const interceptor = new TransformInterceptor();

    const executionContext = {
        switchToHttp: jest.fn().mockReturnThis(),
        getRequest: jest.fn().mockReturnThis(),
    };

    const callHandler = {
        handle: jest.fn(),
    };

    const callHandlerWithPipe = {
        handle: {
            pipe: {
                map: jest.fn()
            }
        },
    };

    it('should be defined', () => {
        expect(interceptor).toBeDefined();
    });

    it('should transform the message', () => {
        callHandler.handle.mockReturnValue({
            pipe: () => ({
                is_error: false,
                message: 'fake message',
                data: null,
            }),
        });
        const call = interceptor.intercept(executionContext as any, callHandler as any);
        expect(call).toBeDefined();
        expect(call).toHaveProperty('is_error');
        expect(call).toHaveProperty('message');
        expect(call).toHaveProperty('data');
    });

    it('should transform the message', () => {
        callHandlerWithPipe.handle.pipe.map.mockReturnValue({
            is_error: false,
            message: 'fake message',
            data: null,
        });
        const call = interceptor.intercept(executionContext as any, callHandler as any);
        expect(call).toBeDefined();
        expect(call).toHaveProperty('is_error');
        expect(call).toHaveProperty('message');
        expect(call).toHaveProperty('data');
    });
});

describe('intercept', () => {
    let context: ExecutionContext;
    let next: CallHandler;
    let interceptor: NestInterceptor; // Replace with the actual type of your interceptor

    beforeEach(() => {
        context = {} as ExecutionContext;
        next = {
            handle: () => of({ message: undefined, data: undefined }) // Simulate undefined message and data
        } as CallHandler;

        interceptor = new TransformInterceptor(); // Initialize your interceptor here
    });

    it('should transform undefined message and data into default values', () => {
        const response$ = interceptor.intercept(context, next) as Observable<any>;

        response$.subscribe(response => {
            expect(response.is_error).toBe(false);
            expect(response.message).toBe('');
            expect(response.data).toEqual({});
        });
    });
});
