import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { ApiException } from '../../utils';

@Injectable()
export class LegancyErpSyncService {
    constructor(
        @InjectEntityManager('localConnection') private readonly localEntityManager: EntityManager,
        @InjectEntityManager('cloudConnection') private readonly cloudEntityManager: EntityManager,
    ) {}

    async getDataFromTableByStoreProcess(entityManager: EntityManager, storeProcess: string) {
        //run get store process
        const result = await entityManager.query(storeProcess);
        return result;
    }

    async microServiceToErpSync() {
        try {
            const getDataFromMicroServiceArticleTable = await this.getDataFromTableByStoreProcess(
                this.localEntityManager,
                'GetDataFromArticlesFromMsoft',
            );

            if (getDataFromMicroServiceArticleTable.length === 0) {
                return;
            }

            await Promise.all(
                getDataFromMicroServiceArticleTable.map((item: any) =>
                    this.processMicroServiceItem(item),
                ),
            );

            return;
        } catch (error) {
            throw new ApiException(error, 'Unable to sync data');
        }
    }

    async findArtikelsDataByKURZBEMERKUNG(
        KURZBEMERKUNG: string,
        entityManager: EntityManager,
        viewName: string,
    ) {
        //run get store process
        const result = await entityManager.query(
            `GetDataFromArticlesFromMsoft @ViewName = '${viewName}', @Kurzbemerkung = '${KURZBEMERKUNG}'`,
        );

        return result[0];
    }

    async updateDataInERPArtikelsView(entityManager: EntityManager, microData: any) {
        //run update store process
        await entityManager.query(
            `EXEC dbo.UpdateArticlesFromMsoft @BRUTTO = ${Number(
                microData?.BRUTTO || 0,
            )}, @KURZBEMERKUNG = '${microData?.KURZBEMERKUNG}'`,
        );

        return;
    }

    async processMicroServiceItem(item: any) {
        try {
            if (item && item?.KURZBEMERKUNG && item?.KURZBEMERKUNG != 'NULL') {
                const getDataFromErpArticleTable = await this.findArtikelsDataByKURZBEMERKUNG(
                    item?.KURZBEMERKUNG,
                    this.cloudEntityManager,
                    'dbo.ArticlesFromMsoft',
                );

                if (getDataFromErpArticleTable) {
                    if (
                        item?.BRUTTO &&
                        getDataFromErpArticleTable?.BRUTTO &&
                        item?.BRUTTO != getDataFromErpArticleTable?.BRUTTO
                    ) {
                        await this.updateDataInERPArtikelsView(this.cloudEntityManager, item);
                    }
                }
            }
        } catch (error) {
            throw new ApiException(error, 'Unable to process microservice data'); // Re-throw the error for the outer try-catch block to catch
        }
    }
}
