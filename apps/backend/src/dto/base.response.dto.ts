export class BaseResponseDto {
    message: string;

    isError: boolean;

    data: any;

    constructor(message: string, data: any) {
        this.message = message;
        this.isError = false;
        this.data = data;
    }
}
