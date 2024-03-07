import type { Config } from 'jest';
import * as path from 'path';
export const jestOutPutDir = () => {
    return path.resolve(__dirname, '.test', 'reports');
};

export default async (project: string): Promise<Config> => {
    const coverageDir = path.resolve(__dirname, '.test', 'coverage', project);
    return {
        coverageDirectory: coverageDir,
        verbose: true,
        moduleFileExtensions: ['js', 'json', 'ts', 'tsx'],
        testRegex: '.*\\.(spec|test)\\.tsx$',
        transform: {
            '^.+\\.(t|j)s$': 'ts-jest',
        },
        testResultsProcessor: 'jest-junit',
        collectCoverageFrom: ['**/*.(t|j)s'],
        reporters: [
            'default',
            [
                'jest-junit',
                {
                    suiteName: `${project} jest tests`,
                    outputDirectory: jestOutPutDir(),
                    outputName: `${project}-junit.xml`,
                    uniqueOutputName: 'false',
                    classNameTemplate: '{classname}-{title}',
                    titleTemplate: '{classname}-{title}',
                    ancestorSeparator: ' › ',
                    usePathForSuiteName: 'true',
                },
            ],
        ],
        testEnvironment: 'node',
    };
};
