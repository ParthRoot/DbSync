import { HttpException } from '@nestjs/common';

/**
 * Unautherization error.
 */
export class UnautherizationError extends HttpException {
    constructor(message: string) {
        super(message, 401);
    }
}
