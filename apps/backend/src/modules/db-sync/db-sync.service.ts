import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { ApiException, logger } from '../../utils';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ReportService } from '../report/report.service';

@Injectable()
export class DbSyncService {
    constructor(
        @InjectEntityManager('localConnection') private readonly localEntityManager: EntityManager,
        @InjectEntityManager('cloudConnection') private readonly cloudEntityManager: EntityManager,
        @InjectEntityManager('legancyConnection')
        private readonly legancyEntityManager: EntityManager,
        private readonly reportService: ReportService,
    ) {}

    /**
     * get data from view and table
     * @param entityManager: EntityManager
     * @param viewName: string
     * @returns
     */
    async getDataFromView(entityManager: EntityManager, viewName: string) {
        const query = `SELECT TOP 5 * FROM ${viewName}`;
        const result = await entityManager.query(query);
        return result;
    }

    /**
     * it will get artikel data by KURZBEMERKUNG
     * @param KURZBEMERKUNG: string
     * @param entityManager: EntityManager
     * @param viewName: string
     * @returns
     */
    async findArtikelsDataByKURZBEMERKUNG(
        KURZBEMERKUNG: string,
        entityManager: EntityManager,
        viewName: string,
    ) {
        const query = `SELECT * FROM ${viewName} WHERE KURZBEMERKUNG='${KURZBEMERKUNG}'`;

        const result = await entityManager.query(query);
        return result[0];
    }

    /**
     * it will insert
     * @param entityManager: EntityManager
     * @param item:any
     * @returns
     */
    async insertDataInMicroServiceArtikelsView(entityManager: EntityManager, item: any) {
        // Construct the values for the current item
        const rowValues = [
            `'${item.ARTTEXT || 'NULL'}'`,
            `'${item.KURZBEMERKUNG || 'NULL'}'`,
            Number(item.BRUTTO || 0),
            `'${item.BESTELLNR || 'NULL'}'`,
            `'${item.BEMERKUNG || 'NULL'}'`,
            Number(item.ROWADRESSEN || 0),
            'GETDATE()',
            'GETDATE()',
        ].join(', ');

        const query = `INSERT INTO dbo.ArticlesFromMsoft  (ARTTEXT, KURZBEMERKUNG, BRUTTO, BESTELLNR, BEMERKUNG, ROWADRESSEN, FirstTimeSyncDate, LastSync)
        VALUES (${rowValues})`;

        await entityManager.query(query);

        return;
    }

    /**
     * it will insert data in legancy artikel table
     * @param entityManager: EntityManager
     * @param item: any
     * @returns
     */
    async insertDataInLegancyArtikelTable(entityManager: EntityManager, item: any) {
        try {
            const rowValues = [
                `'${item.KURZBEMERKUNG || 'NULL'}'`,
                `'${item.ARTTEXT || 'NULL'}'`,
                Number(item.BRUTTO || 0),
                `'${item.BESTELLNR || 'NULL'}'`,
                `'${item.BEMERKUNG || 'NULL'}'`,
                Number(item.ROWADRESSEN || 0),
            ].join(', ');

            const query = `INSERT INTO dbo.en_Artikel  (Artikelnr, Bezeichnung, Preis, Herst_Artikelnr, Herst_Bezeichnung, en_LieferantID)
            VALUES (${rowValues})`;

            await entityManager.query(query);

            return;
        } catch (error) {
            throw new ApiException(error, '');
        }
    }

    /**
     * it will update data in microservice Artikel view
     * @param entityManager: EntityManager
     * @param erpData: any
     * @returns
     */
    async updateDataInMicroServiceArtikelsView(entityManager: EntityManager, erpData: any) {
        // const setData = `Bezeichnung = '${erpData?.ARTTEXT || 'NULL'}',KURZBEMERKUNG = '${
        //     erpData?.KURZBEMERKUNG || 'NULL'
        // }',BRUTTO = ${Number(erpData?.BRUTTO || 0)},BESTELLNR = '${
        //     erpData?.BESTELLNR || 'NULL'
        // }',BEMERKUNG = '${erpData?.BEMERKUNG || 'NULL'}',ROWADRESSEN = ${Number(
        //     erpData?.ROWADRESSEN || 0,
        // )},UpdatedDate = GETDATE(), LastSync = GETDATE()`;

        const setData = `BRUTTO = ${Number(
            erpData?.BRUTTO || 0,
        )},UpdatedDate = GETDATE(), LastSync = GETDATE(),isUpdateLegancySync = ${Number(0)}`;
        const whereCondition = `KURZBEMERKUNG = '${erpData?.KURZBEMERKUNG}'`;
        const queryUpdateRecord = `UPDATE dbo.ArticlesFromMsoft SET ${setData} WHERE ${whereCondition}`;
        await entityManager.query(queryUpdateRecord);

        return;
    }

    /**
     * it will update date in legancy artikel table
     * @param entityManager: EntityManager
     * @param microServiceData: any
     * @returns
     */
    async updateDataInLegancyArtikelTable(entityManager: EntityManager, microServiceData: any) {
        // const setData = `Bezeichnung = '${microServiceData?.ARTTEXT || 'NULL'}',Artikelnr = '${
        //     microServiceData?.KURZBEMERKUNG || 'NULL'
        // }',Preis = ${Number(microServiceData?.BRUTTO || 0)},Herst_Artikelnr = '${
        //     microServiceData?.BESTELLNR || 'NULL'
        // }',Herst_Bezeichnung = '${microServiceData?.BEMERKUNG || 'NULL'}',en_LieferantID = ${Number(
        //     microServiceData?.ROWADRESSEN || 0,
        // )}`;

        const setData = `Preis = ${Number(microServiceData?.BRUTTO || 0)}`;
        const whereCondition = `Artikelnr = '${microServiceData?.KURZBEMERKUNG}'`;
        const queryUpdateRecord = `UPDATE dbo.en_Artikel SET ${setData} WHERE ${whereCondition}`;
        await entityManager.query(queryUpdateRecord);

        return;
    }

    /**
     * it will sync data erp to microservice
     * @returns
     */
    async erpToMicroSync() {
        try {
            let logsData: any[] = [];

            const erpData = await this.getDataFromView(
                this.cloudEntityManager,
                'IKlarLuft.ArticlesFromMsoft',
            );

            if (erpData.length === 0) {
                return;
            }

            await Promise.all(erpData.map((item: any) => this.processErpItem(item, logsData)));
            await this.reportService.generateExcel(logsData, 'erp-mrs-report-logs');
            return;
        } catch (error) {
            throw new ApiException(error, 'Unable to sync data');
        }
    }

    /**
     * Process individual item from ERP data
     * @param item Item to be processed
     */
    async processErpItem(item: any, logsData: any[]) {
        try {
            if (item && item?.KURZBEMERKUNG && item?.KURZBEMERKUNG != 'NULL') {
                const data = await this.findArtikelsDataByKURZBEMERKUNG(
                    item?.KURZBEMERKUNG,
                    this.localEntityManager,
                    'dbo.ArticlesFromMsoft',
                );

                if (!data) {
                    await this.insertDataInMicroServiceArtikelsView(this.localEntityManager, item);
                    await this.reportService.syncDataLogs(item, logsData, 'INSERT', 'SUCCESS');
                } else {
                    if (item?.BRUTTO && data?.BRUTTO && item?.BRUTTO != data?.BRUTTO) {
                        await this.updateDataInMicroServiceArtikelsView(
                            this.localEntityManager,
                            item,
                        );
                        await this.reportService.syncDataLogs(item, logsData, 'UPDATE', 'SUCCESS');
                    }
                }
            }
        } catch (error) {
            throw new BadRequestException('Unable to process ERP data'); // Re-throw the error for the outer try-catch block to catch
        }
    }

    /**
     * it will sync data microservice to legancy
     * @returns
     */
    async microToLegancySync() {
        try {
            const query = `SELECT TOP 5 * FROM dbo.ArticlesFromMsoft WHERE isUpdateLegancySync = ${Number(
                0,
            )}`;

            const microServiceData = await this.localEntityManager.query(query);

            let logsData: any[] = [];

            if (microServiceData.length === 0) {
                return;
            }

            await Promise.all(
                microServiceData.map((item: any) =>
                    this.processMicroServiceItem(item, this.localEntityManager, logsData),
                ),
            );

            await this.reportService.generateExcel(logsData, 'mrs-legancy-report-logs');

            return;
        } catch (error) {
            throw new ApiException(error, 'Unable to sync data');
        }
    }

    /**
     * Process individual item from ERP data
     * @param item Item to be processed
     */
    async processMicroServiceItem(item: any, entityManager: EntityManager, logsData: any[]) {
        try {
            if (item && item?.KURZBEMERKUNG && item?.KURZBEMERKUNG != 'NULL') {
                const query = `SELECT * FROM dbo.en_Artikel WHERE Artikelnr='${item.KURZBEMERKUNG}'`;

                const result = await this.legancyEntityManager.query(query);
                const data = result[0];

                if (!data) {
                    // await this.insertDataInLegancyArtikelTable(this.legancyEntityManager, item);
                    // const setData = `isCreateLegancySync = ${Number(1)}`;
                    // const whereCondition = `KURZBEMERKUNG = '${item?.KURZBEMERKUNG}'`;
                    // const queryUpdateRecord = `UPDATE dbo.ArticlesFromMsoft SET ${setData} WHERE ${whereCondition}`;
                    // await entityManager.query(queryUpdateRecord);
                } else {
                    if (item?.BRUTTO && data?.Preis && item?.BRUTTO != data?.Preis) {
                        await this.updateDataInLegancyArtikelTable(this.legancyEntityManager, item);

                        const setData = `isUpdateLegancySync = ${Number(1)}`;
                        const whereCondition = `KURZBEMERKUNG = '${item?.KURZBEMERKUNG}'`;
                        const queryUpdateRecord = `UPDATE dbo.ArticlesFromMsoft SET ${setData} WHERE ${whereCondition}`;
                        await entityManager.query(queryUpdateRecord);
                        await this.reportService.syncDataLogs(item, logsData, 'UPDATE', 'SUCCESS');
                    }
                }
            }
        } catch (error) {
            throw new BadRequestException('Unable to process microservice data'); // Re-throw the error for the outer try-catch block to catch
        }
    }

    @Cron(CronExpression.EVERY_12_HOURS)
    erpToMicroServiceSync() {
        this.erpToMicroSync();
        logger.warn('ERP to Microservice synchronization completed successfully.');
        return;
    }

    @Cron(CronExpression.EVERY_12_HOURS)
    microServiceToLegancySync() {
        this.microToLegancySync();
        logger.warn('Microservice to Legancy synchronization completed successfully.');
        return;
    }
}
