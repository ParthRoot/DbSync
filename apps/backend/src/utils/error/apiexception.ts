import { HttpException, HttpStatus } from '@nestjs/common';

export class ApiException extends HttpException {
    constructor(error: any, alternateErrorMsg: string) {
        super(error.message ?? alternateErrorMsg, error.status ?? HttpStatus.BAD_REQUEST);
    }
}
