import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequestLoggerMiddleware } from '../utils';
import {
    cloudTypeOrmConfig,
    legancyTypeOrmConfig,
    typeOrmConfig,
} from '../utils/database/connection';
import { TestModule } from '../modules/test/test.module';
import { ScheduleModule } from '@nestjs/schedule';
import { DbSyncModule } from '../modules/db-sync/db-sync.module';
import { ReportModule } from '../modules/report/report.module';
import { LegancyErpSyncModule } from '../modules/legancy-erp-sync/legancy-erp-sync.module';

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            name: 'localConnection',
            useFactory: () => typeOrmConfig,
        }),

        TypeOrmModule.forRootAsync({
            name: 'cloudConnection',
            useFactory: () => cloudTypeOrmConfig,
        }),

        TypeOrmModule.forRootAsync({
            name: 'legancyConnection',
            useFactory: () => legancyTypeOrmConfig,
        }),
        ScheduleModule.forRoot(),
        TestModule,
        DbSyncModule,
        ReportModule,
        LegancyErpSyncModule,
    ],
    controllers: [AppController],
})
export class AppModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(RequestLoggerMiddleware).forRoutes('*');
    }
}
