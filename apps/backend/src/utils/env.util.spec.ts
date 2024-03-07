import { EnvError, getEnv } from "./env.util"

import * as a from './env.util'

describe('getEnv', () => {
    it('throws an EnvError when env variable is not found', () => {
        // Mock the process.env object to not have the required environment variable
        const originalEnv = process.env;
        process.env = {};
        
        // The function should throw an EnvError when the environment variable is not found
        expect(() => {
            getEnv('SOME_ENV_VARIABLE_NAME');
        }).toThrow(EnvError);

        // Reset the process.env object
        process.env = originalEnv;
    });
});

describe('env file not found', () => {
    it('log error if .env not found', () => {
        const envFile = a.envFile();
        expect(envFile).toEqual('.env')
    });
});


describe('set env variable', () => {
    it('set env variable a value', () => {
        a.setEnv('ENVV', 'sdjdsakdakd');   
    });
});