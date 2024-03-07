import { Injectable } from '@nestjs/common';
import { ApiException } from '../../utils';
import { VIEW_EXCEL_STYLE } from '../../config';
import * as ExcelJS from 'exceljs';
const { DateTime } = require('luxon');

@Injectable()
export class ReportService {
    constructor() {}

    async syncDataLogs(item: any, logsData: any[], status: string, type: string) {
        try {
            logsData.push({
                KURZBEMERKUNG: item?.KURZBEMERKUNG,
                DATA: item,
                TYPE: type,
                STATUS: status,
                CREATED_AT: DateTime.local().toFormat('dd/yy/MM HH:mm:ss'),
            });
        } catch (error) {
            throw new ApiException(error, 'Logs generate successfully.');
        }
    }

    async generateExcel(data: any[], folderName: string) {
        try {
            if (data.length === 0) {
                return;
            }
            const excelTitle: any[] = [];

            for (let key in data[0]) {
                excelTitle.push({ header: key, width: 20, id: key });
            }

            // // Specify the folder path where you want to save the file
            // const folderPath = `./${folderName}/`;
            // const filePath = folderPath + `${DateTime.local().toFormat('dd-MM-yy HH:mm:ss')}.xlsx`; // Path to the specific folder

            // Specify the folder path where you want to save the file
            const folderPath = `./${folderName}/`;
            const fileName = `${DateTime.local().toFormat('dd-MM-yy HH-mm-ss')}.xlsx`; // Adjusted file name to replace invalid characters
            const filePath = `${folderPath}${fileName}`;

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

            for (const item of data) {
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

            await workbook.xlsx.writeFile(filePath);

            return;
        } catch (error) {
            throw new ApiException(error, 'Unable to generate excel');
        }
    }
}
