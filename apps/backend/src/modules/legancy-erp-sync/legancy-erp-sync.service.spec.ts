import { Test, TestingModule } from '@nestjs/testing';
import { LegancyErpSyncService } from './legancy-erp-sync.service';

describe('LegancyErpSyncService', () => {
  let service: LegancyErpSyncService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LegancyErpSyncService],
    }).compile();

    service = module.get<LegancyErpSyncService>(LegancyErpSyncService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
