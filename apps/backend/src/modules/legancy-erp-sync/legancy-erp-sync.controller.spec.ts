import { Test, TestingModule } from '@nestjs/testing';
import { LegancyErpSyncController } from './legancy-erp-sync.controller';

describe('LegancyErpSyncController', () => {
  let controller: LegancyErpSyncController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LegancyErpSyncController],
    }).compile();

    controller = module.get<LegancyErpSyncController>(LegancyErpSyncController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
