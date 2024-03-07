import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from '../../../src/app/app.controller';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController]
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      const hello = appController.getHello()
      expect(hello).toHaveProperty("data.code")
      expect(hello).toHaveProperty("message")
    });
  });
});
