import { getEnv, loadEnv } from '../../env.util';
loadEnv();
export const databaseConf = {
    DB_TYPE: () => getEnv('DB_TYPE') as any,
    DB_HOST: () => getEnv('DB_HOST'),
    DB_PORT: () => parseInt(getEnv('DB_PORT')),
    DB_USERNAME: () => getEnv('DB_USERNAME'),
    DB_PASSWORD: () => getEnv('DB_PASSWORD'),
    DB_NAME: () => getEnv('DB_NAME'),
    LOG_LEVEL: () => getEnv('DB_LOG_LEVEL'),
};

export const legancyDatabaseConf = {
    DB_TYPE: () => getEnv('LEGANCY_DB_TYPE') as any,
    DB_HOST: () => getEnv('LEGANCY_DB_HOST'),
    DB_PORT: () => parseInt(getEnv('LEGANCY_DB_PORT')),
    DB_USERNAME: () => getEnv('LEGANCY_DB_USERNAME'),
    DB_PASSWORD: () => getEnv('LEGANCY_DB_PASSWORD'),
    DB_NAME: () => getEnv('LEGANCY_DB_NAME'),
    LOG_LEVEL: () => getEnv('DB_LOG_LEVEL'),
};

export const cloudSqlDatabaseConf = {
    DB_TYPE: () => getEnv('DEV_DB_TYPE') as any,
    DB_HOST: () => getEnv('DEV_DB_HOST'),
    DB_PORT: () => parseInt(getEnv('DEV_DB_PORT')),
    DB_USERNAME: () => getEnv('DEV_DB_USERNAME'),
    DB_PASSWORD: () => getEnv('DEV_DB_PASSWORD'),
    DB_NAME: () => getEnv('DEV_DB_NAME'),
    LOG_LEVEL: () => getEnv('DEV_DB_LOG_LEVEL'),
};
