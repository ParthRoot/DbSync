import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';

describe('AppController', () => {
    let controller: AppController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [],
            controllers: [AppController],
            providers: [],
        }).compile();

        controller = module.get<AppController>(AppController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should return proper message', () => {
        const hello = controller.getHello();
        expect(hello).toHaveProperty('data');
        expect(hello).toHaveProperty('message');
    });
});
