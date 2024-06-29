import { Controller, Get } from '@nestjs/common';
import { DbSyncService } from './db-sync.service';
import { BaseResponseDto } from '../../dto';

@Controller('db-sync')
export class DbSyncController {
    constructor(private readonly dbSyncService: DbSyncService) {}

    //Hello WOrld
    @Get('erp-to-micro-sync')
    async erpToMicroserviceDataSync() {
        const result = await this.dbSyncService.erpToMicroSync();
        return new BaseResponseDto('ERP to micro service data sync successfully', result);
    }

    @Get('micro-to-legancy-sync')
    async microServiceToLegancyDataSync() {
        const result = await this.dbSyncService.microToLegancySync();
        return new BaseResponseDto('Micro service to legancy data sync successfully', result);
    }
}
