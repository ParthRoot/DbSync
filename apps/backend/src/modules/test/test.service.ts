import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { InjectEntityManager } from '@nestjs/typeorm';
import { ApiException } from '../../utils';
import { messages } from '../../lang/api-messages';
import { VIEW_EXCEL_STYLE } from '../../config';
import * as ExcelJS from 'exceljs';
import { Response } from 'express';

@Injectable()
export class TestService {
    i = 0;
    constructor(
        @InjectEntityManager('localConnection') private readonly localEntityManager: EntityManager,
        @InjectEntityManager('cloudConnection') private readonly cloudEntityManager: EntityManager,
        @InjectEntityManager('legancyConnection')
        private readonly legancyEntityManager: EntityManager,
    ) {}

    async getDataFromLocalConnection() {
        try {
            const query = 'SELECT * FROM [File]';
            const result = await this.localEntityManager.query(query);
            return result;
        } catch (error) {
            throw new ApiException(error, messages.unableToVerifyDb);
        }
    }

    async getDataFromCloudConnection() {
        try {
            const query = `SELECT TOP 200 * FROM IKlarLuft.ArticlesFromMsoft`;
            const result = await this.cloudEntityManager.query(query);
            return result;
        } catch (error) {
            throw new ApiException(error, messages.unableToVerifyDb);
        }
    }

    async getDataFromCloudConnectionContractsFromMicrosoft() {
        try {
            const query = `SELECT * FROM MMC_Daten.dbo.ContractsFromMicrosoftView`;
            const result = await this.cloudEntityManager.query(query);
            return result;
        } catch (error) {
            throw new ApiException(error, messages.unableToVerifyDb);
        }
    }

    async findFileData(fileId: string, entityManager: EntityManager) {
        const query = `SELECT * FROM [File] WHERE Uuid='${fileId}'`;

        const result = await entityManager.query(query);

        if (!result[0]) {
            throw new NotFoundException('File data not found');
        }
        return result[0];
    }

    async updateCloudToLocal(fileId: string, entityManager: EntityManager) {
        try {
            const fileData = await this.findFileData(fileId, this.cloudEntityManager);

            const setData = `UseFrequency = ${fileData?.UseFrequency}, 
            ModelName = '${fileData?.ModelName}',FieldName = '${fileData?.FieldName}',
            ServerFilePath = '${fileData?.ServerFilePath}',
            FileExtension = '${fileData?.FileExtension}'`;

            const whereCondition = `Uuid = '${fileId}'`;

            const queryUpdateRecord = `UPDATE [File] SET ${setData} WHERE ${whereCondition}`;

            await entityManager.query(queryUpdateRecord);

            return;
        } catch (error) {
            throw new ApiException(error, 'unable to update data');
        }
    }

    async generateLocalExcelForViewsData(res: Response) {
        try {
            const viewData = await this.getDataFromCloudConnection();

            const excelTitle: any[] = [];

            for (let key in viewData[0]) {
                excelTitle.push({ header: key, width: 20, id: key });
            }

            const filename = './reports.xlsx';

            let workbook = new ExcelJS.Workbook();

            workbook = await workbook.xlsx.readFile(filename);

            const originalViewExcelHeaders = [...excelTitle];

            const sheets = workbook.worksheets.map((sheet) => sheet.name);

            const worksheet = workbook.addWorksheet('ViewDataReport');

            worksheet.columns = [...originalViewExcelHeaders];
            worksheet.getRow(1).font = VIEW_EXCEL_STYLE.font as ExcelJS.Font;
            worksheet.getRow(1).fill = VIEW_EXCEL_STYLE.fill as ExcelJS.Fill;

            let rowNumber = 2;

            for (let index = 2; index < 500; index++) {
                // for do empty rows
                worksheet.getRow(index).values = [];
            }

            for (const item of viewData) {
                const rowValues = originalViewExcelHeaders.map((header) => {
                    return (item as any)[header.id];
                });
                worksheet.getRow(rowNumber).values = rowValues;
                rowNumber++;
            }

            sheets.map((sheet) => {
                //delete already available sheet
                workbook.removeWorksheet(sheet);
            });

            const buffer = await workbook.xlsx.writeBuffer();

            res.writeHead(200, {
                'Content-Type': 'application/vnd.ms-excel; charset=utf-8',
                'Content-disposition': `attachment; filename=reports.xlsx`,
            });

            // Sending the signal to the client
            res.end(buffer, 'binary');
        } catch (error) {
            throw new ApiException(error, 'unable to create report');
        }
    }

    async getDataByStoreProcess() {
        try {
            // execute predefined store process with argument
            // const result = await this.localEntityManager.query(`DECLARE @tag date = '2024-02-10';
            // DECLARE @wert int = 10;
            // SELECT dbo.fcDateTimeAusLong(@tag, @wert) AS Result;`);

            //execute new built in store process
            const result = await this.localEntityManager.query(`testGetData`);

            return result;
        } catch (error) {
            throw new ApiException(error, 'unable to run store process');
        }
    }

    async getDataFromLegancyConnection() {
        try {
            const query = `SELECT * FROM vw_aspnet_Users`;
            const result = await this.legancyEntityManager.query(query);
            return result;
        } catch (error) {
            throw new ApiException(error, messages.unableToVerifyDb);
        }
    }

    async createView() {
        const query = `
            CREATE VIEW dbo.ArticlesFromMsoftView AS
            SELECT
            ArticleId,
            KATALOG,
            ARTIKEL,
            SUCHWORT,
            ARTTEXT,
            ARTEinheit,
            WGR,
            KALKARTL,
            EINKAUF,
            BRUTTO1,
            KALKARTIM,
            HAUPTLIEF,
            BRUTTO,
            NETTO,
            LieEinheit,
            PEINHEIT,
            BESTELLNR,
            BEMERKUNG,
            LIEFNR,
            ROWADRESSEN,
            NAME,
            KURZBEMERKUNG,
            Bestand,
            BestandReserviert,
            BestandBestellt,
            BestandVerfuegbar
            FROM
            ArticlesFromMsoft; -- Replace YourTableName with the actual table name
        `;

        try {
            await this.cloudEntityManager.query(query);
        } catch (error) {
            throw new ApiException(error, 'Unable to create views');
        }
    }

    async getDataFromCloudAddInLocalDb() {
        try {
            const viewData = await this.getDataFromCloudConnection();

            let values = ``;

            viewData.forEach((item: any, index: number) => {
                // Construct the values for the current item
                const rowValues = [
                    Number(item.ArticleId || 0),
                    `'${item.KATALOG}'`,
                    `'${item.ARTIKEL || 'NULL'}'`,
                    `'${item.SUCHWORT || 'NULL'}'`,
                    `'${item.ARTTEXT || 'NULL'}'`,
                    `'${item.ARTEinheit || 'NULL'}'`,
                    `'${item.WGR || 'NULL'}'`,
                    `'${item.KALKARTL || 'NULL'}'`,
                    Number(item.EINKAUF || 0),
                    Number(item.BRUTT01 || 0),
                    `'${item.KALKARTM || 'NULL'}'`,
                    Number(item.HAUPTLIEF || 0),
                    Number(item.BRUTTO || 0),
                    Number(item.NETTO || 0),
                    `'${item.LiefEinheit || 'NULL'}'`,
                    Number(item.PEINHEIT || 0),
                    `'${item.BESTELLNR || 'NULL'}'`,
                    `'${item.BEMERKUNG || 'NULL'}'`,
                    Number(item.LIEFNR || 0),
                    Number(item.ROWADRESSEN || 0),
                    `'${item.NAME || 'NULL'}'`,
                ].join(', ');

                // Append the values to the 'values' string
                values += `(${rowValues})`;

                // Add a comma if it's not the last item
                if (index < viewData.length - 1) {
                    values += ', ';
                }
            });

            const query = `INSERT INTO dbo.ArticlesFromMsoft  (ArticleId, KATALOG, ARTIKEL, SUCHWORT, ARTTEXT, ARTEinheit, WGR, KALKARTL, EINKAUF, BRUTT01, KALKARTIM, HAUPTLIEF, BRUTTO, NETTO, LieEinheit, PEINHEIT, BESTELLNR, BEMERKUNG, LIEFNR, ROWADRESSEN, NAME)
            VALUES 
            ${values};`;

            await this.localEntityManager.query(query);

            return query;
        } catch (error) {
            throw new ApiException(error, 'Unable to add data in views');
        }
    }

    async getDataFromCloudAddInLocalDbContractsFromMicrosoft() {
        try {
            const viewData = await this.getDataFromCloudConnectionContractsFromMicrosoft();

            let values = ``;

            viewData.forEach((item: any, index: number) => {
                // Construct the values for the current item
                const rowValues = [
                    Number(item.VorgangId || 0),
                    Number(item.VORGANGNR || 0),
                    `'${item.BELEGSTATUS || 'NULL'}'`,
                    `'${item.BETREFF || 'NULL'}'`,
                    item.DATUMERF
                        ? `'${new Date(item.DATUMERF).toISOString().slice(0, 19)}'`
                        : 'NULL',
                    `'${item.BELEGART || 'NULL'}'`,
                    item.VorgangLt
                        ? `'${new Date(item.VorgangLt).toISOString().slice(0, 19)}'`
                        : 'NULL',
                    Number(item.PosId || 0),
                    `'${item.POSITION || 'NULL'}'`,
                    `'${item.ARTIKEL || 'NULL'}'`,
                    `'${item.ARTTEXT || 'NULL'}'`,
                    Number(item.MEBESTELLT || 0),
                    `'${item.EINHEIT || 'NULL'}'`,
                    item.PosLt ? `'${new Date(item.PosLt).toISOString().slice(0, 19)}'` : 'NULL',
                ].join(', ');

                // Append the values to the 'values' string
                values += `(${rowValues})`;

                // Add a comma if it's not the last item
                if (index < viewData.length - 1) {
                    values += ', ';
                }
            });

            const query = `INSERT INTO dbo.ContractsFromMicrosoft  (VorgangId, VORGANGNR, BELEGSTATUS, BETREFF, DATUMERF, BELEGART, VorgangLt, PosId, POSITION, ARTIKEL, ARTTEXT, MEBESTELLT, EINHEIT, PosLt)
            VALUES 
            ${values};`;

            await this.localEntityManager.query(query);

            return query;
        } catch (error) {
            throw new ApiException(error, 'Unable to add data in views');
        }
    }

    async addDataInViewByCsv(data: any[]) {
        try {
            let values = ``;

            data.forEach((item: any, index: number) => {
                // Construct the values for the current item
                const rowValues = [
                    Number(item.ArticleId),
                    `'${item.KATALOG}'`,
                    `'${item.ARTIKEL || 'NULL'}'`,
                    `'${item.SUCHWORT || 'NULL'}'`,
                    `'${item.ARTTEXT || 'NULL'}'`,
                    `'${item.KURZBEMERKUNG || 'NULL'}'`,
                    `'${item.ARTEinheit || 'NULL'}'`,
                    `'${item.WGR || 'NULL'}'`,
                    `'${item.KALKARTL || 'NULL'}'`,
                    Number(item.EINKAUF),
                    Number(item.BRUTTO1),
                    `'${item.KALKARTM || 'NULL'}'`,
                    Number(item.HAUPTLIEF),
                    Number(item.BRUTTO),
                    Number(item.NETTO),
                    `'${item.LiefEinheit || 'NULL'}'`,
                    Number(item.PEINHEIT),
                    `'${item.BESTELLNR || 'NULL'}'`,
                    `'${item.BEMERKUNG || 'NULL'}'`,
                    Number(item.LIEFNR),
                    Number(item.ROWADRESSEN),
                    `'${item.NAME || 'NULL'}'`,
                ].join(', ');

                // Append the values to the 'values' string
                values += `(${rowValues})`;

                // Add a comma if it's not the last item
                if (index < data.length - 1) {
                    values += ', ';
                }
            });

            const query = `INSERT INTO ArticlesFromMsoft  (ArticleId, KATALOG, ARTIKEL, SUCHWORT, ARTTEXT, KURZBEMERKUNG, ARTEinheit, WGR, KALKARTL, EINKAUF, BRUTTO1, KALKARTIM, HAUPTLIEF, BRUTTO, NETTO, LieEinheit, PEINHEIT, BESTELLNR, BEMERKUNG, LIEFNR, ROWADRESSEN, NAME)
            VALUES 
            ${values};`;

            await this.cloudEntityManager.query(query);
        } catch (error) {
            throw new ApiException(error, 'Unable to add data in views');
        }
    }
}
