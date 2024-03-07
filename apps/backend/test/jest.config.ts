import type { Config } from 'jest';
import baseJestConfig from '../../../jest.config.base';
import * as path from 'path';

const ignorePath = (...p: string[]) => {
    return p.map((val) => path.resolve(__dirname, '..', val));
};

export default async (): Promise<Config> => {
    const rootDir = path.resolve(__dirname, '../src/modules');
    const baseJestConf = await baseJestConfig('app_backend');

    const filesToIgnore = ignorePath(
        './dist',
        './node_modules',
        './test',
        './src/modules/reports',
        './.eslintrc.js',
        './.prettierrc.js',
        '../../jest.config.base.ts',
        './src/talent/mock/repo',
        './src/modules/users/mock',
        './src/modules/users/query',
        './src/modules/users/dto',
        './src/main.ts',
        './src/users/users.module.ts',
        './src/migrations',
        './src/seeds',
        './src/utils/database',
    );

    return {
        ...baseJestConf,
        modulePathIgnorePatterns: filesToIgnore,
        showSeed: true,
        notify: false,
        verbose: true,
        testRegex: '.*\\.spec\\.ts$',
        collectCoverageFrom: [
            '**/**.(t|j)s',
            '!**/*.module.(t|j)s',
            '!**/*.dto.(t|j)s',
            '!**/common/**/*',
            '!**/query/**/*',
            '!**/mock/**/*',
        ],
        transform: {
            '^.+\\.ts?$': [
                'ts-jest',
                {
                    tsconfig: {
                        allowJs: true,
                        experimentalDecorators: true,
                    },
                },
            ],
        },
        rootDir: rootDir,
    };
};
