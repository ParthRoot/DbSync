import { Test, TestingModule } from '@nestjs/testing';
import { DbSyncService } from './db-sync.service';

describe('DbSyncService', () => {
    let service: DbSyncService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [DbSyncService],
        }).compile();

        service = module.get<DbSyncService>(DbSyncService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
