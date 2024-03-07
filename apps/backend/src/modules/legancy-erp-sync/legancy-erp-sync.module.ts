import { Module } from '@nestjs/common';
import { LegancyErpSyncController } from './legancy-erp-sync.controller';
import { LegancyErpSyncService } from './legancy-erp-sync.service';

@Module({
  controllers: [LegancyErpSyncController],
  providers: [LegancyErpSyncService]
})
export class LegancyErpSyncModule {}
