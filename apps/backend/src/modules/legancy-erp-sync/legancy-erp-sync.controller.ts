import { Controller, Get } from '@nestjs/common';
import { LegancyErpSyncService } from './legancy-erp-sync.service';
import { BaseResponseDto } from '../../dto';

@Controller('legancy-erp-sync')
export class LegancyErpSyncController {
    constructor(private readonly legancyErpSyncService: LegancyErpSyncService) {}

    @Get('micro-erp-sync')
    async microServiceToErpSync() {
        const result = await this.legancyErpSyncService.microServiceToErpSync();
        return new BaseResponseDto('micro service to ERP data sync successfully', result);
    }
}
