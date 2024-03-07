import {
    Controller,
    Get,
    Param,
    Post,
    Put,
    Res,
    UploadedFiles,
    UseInterceptors,
} from '@nestjs/common';
import { TestService } from './test.service';
import { BaseResponseDto } from '../../dto';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { Response } from 'express';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import csv from 'csvtojson';

@Controller('test')
export class TestController {
    constructor(
        private readonly testService: TestService,
        @InjectEntityManager('localConnection') private readonly localEntityManager: EntityManager,
    ) {}

    @Get('local')
    async getDataFromLocalConnection() {
        // const result = await this.testService.getDataFromLocalConnection();
        const result = await this.testService.getDataByStoreProcess();

        return new BaseResponseDto('', result);
    }

    @Get('cloud')
    async getDataFromCloudConnection() {
        const result = await this.testService.getDataFromCloudConnection();
        return new BaseResponseDto('', result);
    }

    @Get('legancy')
    async getDataFromLegancyConnection() {
        const result = await this.testService.getDataFromLegancyConnection();
        return new BaseResponseDto('', result);
    }

    @Put('/:fileId')
    async updateCloudToLocal(@Param('fileId') fileId: string) {
        const result = await this.testService.updateCloudToLocal(fileId, this.localEntityManager);
        return new BaseResponseDto('Data Update successfully', result);
    }

    @Get('/local/report')
    async generateLocalExcelForViewsData(@Res() res: Response) {
        const result = await this.testService.generateLocalExcelForViewsData(res);
        return new BaseResponseDto('', result);
    }

    @Get('/store-process')
    async executeStoreProcess() {
        const result = await this.testService.getDataByStoreProcess();
        return new BaseResponseDto('', result);
    }

    @Post('/view')
    async createView() {
        const result = await this.testService.createView();
        return new BaseResponseDto('View created successfully', result);
    }

    @Post('add-cloud-to-local')
    async getDataFromCloudAddInLocalDb() {
        const result = await this.testService.getDataFromCloudAddInLocalDb();
        return new BaseResponseDto('View data added successfully', result);
    }

    @Post('add-cloud-to-local-contract')
    async getDataFromCloudAddInLocalDbContractsFromMicrosoft() {
        const result = await this.testService.getDataFromCloudAddInLocalDbContractsFromMicrosoft();
        return new BaseResponseDto('View data added successfully', result);
    }

    @Post('add-csv-to-table')
    @UseInterceptors(FileFieldsInterceptor([{ name: 'data', maxCount: 1 }]))
    async addDataInViewByCsv(@UploadedFiles() data: any) {
        const twilioBuffer = data['data'][0].buffer;
        const twilioJson = await csv().fromString(twilioBuffer.toString());
        const result = await this.testService.addDataInViewByCsv(twilioJson);
        return new BaseResponseDto('', result);
    }
}
