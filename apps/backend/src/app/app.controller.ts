import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
    @Get()
    getHello() {
        return {
            data: {
                code: 1,
            },
            message: 'works',
        };
    }
}
