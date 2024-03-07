import { Test, TestingModule } from '@nestjs/testing';
import { DbSyncController } from './db-sync.controller';

describe('DbSyncController', () => {
    let controller: DbSyncController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [DbSyncController],
        }).compile();

        controller = module.get<DbSyncController>(DbSyncController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
