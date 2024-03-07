import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { cloudSqlDatabaseConf, databaseConf, legancyDatabaseConf } from '../config';
import path from 'path';

export const migrationFolder = path.join(__dirname, '../../../migrations/**/*.{ts,js}');
// export const migrationFolder = path.join(__dirname, '..', '..', '..', 'migrations', '*.{ts,js}');

export const typeOrmConfig: TypeOrmModuleOptions = {
    type: databaseConf.DB_TYPE(),
    host: databaseConf.DB_HOST(),
    port: databaseConf.DB_PORT(), // Add port configuration if needed
    username: databaseConf.DB_USERNAME(),
    password: databaseConf.DB_PASSWORD(),
    database: databaseConf.DB_NAME(),
    entities: [],
    synchronize: false, // Set to false to disable auto schema synchronization
    migrations: [migrationFolder], // Specify the directory where your migration files are located
    migrationsTableName: 'migrations', // Optional: Customize the name of the migrations table
    extra: {
        encrypt: true,
        trustServerCertificate: true,
    },
};

export const cloudTypeOrmConfig: TypeOrmModuleOptions = {
    type: cloudSqlDatabaseConf.DB_TYPE(),
    host: cloudSqlDatabaseConf.DB_HOST(),
    port: cloudSqlDatabaseConf.DB_PORT(), // Add port configuration if needed
    username: cloudSqlDatabaseConf.DB_USERNAME(),
    password: cloudSqlDatabaseConf.DB_PASSWORD(),
    database: cloudSqlDatabaseConf.DB_NAME(),
    synchronize: false, // Set to false to disable auto schema synchronization
    migrationsTableName: 'migrations', // Optional: Customize the name of the migrations table
    migrations: [migrationFolder], // Specify the directory where your migration files are located
    extra: {
        encrypt: true,
        trustServerCertificate: true,
    },
};

export const legancyTypeOrmConfig: TypeOrmModuleOptions = {
    type: legancyDatabaseConf.DB_TYPE(),
    host: legancyDatabaseConf.DB_HOST(),
    port: legancyDatabaseConf.DB_PORT(), // Add port configuration if needed
    username: legancyDatabaseConf.DB_USERNAME(),
    password: legancyDatabaseConf.DB_PASSWORD(),
    database: legancyDatabaseConf.DB_NAME(),
    synchronize: false, // Set to false to disable auto schema synchronization
    migrationsTableName: 'migrations', // Optional: Customize the name of the migrations table
    migrations: [migrationFolder], // Specify the directory where your migration files are located
    extra: {
        encrypt: true,
        trustServerCertificate: true,
    },
};

export default { typeOrmConfig, cloudTypeOrmConfig };
