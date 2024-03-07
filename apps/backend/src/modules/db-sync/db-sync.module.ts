import { Module } from '@nestjs/common';
import { DbSyncService } from './db-sync.service';
import { DbSyncController } from './db-sync.controller';
import { ReportModule } from '../report/report.module';

@Module({
    providers: [DbSyncService],
    controllers: [DbSyncController],
    imports: [ReportModule],
})
export class DbSyncModule {}
