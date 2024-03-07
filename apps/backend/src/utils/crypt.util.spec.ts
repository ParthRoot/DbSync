import {
    addMonths,
    assertJwt,
    validateJwt,
    comparePassword,
    generateSaltAndHash,
    getDomainFromEmail,
    getMsTimeFromDays,
    jwtSign,
    jwtVerify,
    md5,
    generateRandomString,
    trimAndLowerCase,
    otpGenerator,
} from './crypt.util';
import { UnautherizationError } from './error';

describe('Crypto Util', () => {
    it('[success]: md5', () => {
        const secret = '5ebe2294ecd0e0f08eab7690d2a6ee69';
        const sec = md5('secret');
        expect(sec).toBe(secret);
    });

    it('[success]: jwtSign | jwtVerify', () => {
        const val = {
            secret: 'SECRET',
            JWT_EXPIRES: '1000',
        };
        const sec = jwtSign(val);
        const verify = jwtVerify(sec);
        expect(verify).toBeDefined();
        expect(verify).toHaveProperty('secret');
        expect(verify).toHaveProperty('JWT_EXPIRES');
        expect(verify).toHaveProperty('iat');
        expect(verify).toHaveProperty('exp');
    });

    it('[success]: randomString', () => {
        const length = 10;
        const val = generateRandomString(length);
        expect(val).toBeDefined();
        expect(typeof val === 'string').toBe(true);
        expect(val.length).toBe(length);
    });

    it('[success]: getMsTimeFromDays', () => {
        const days = 10;
        const shouldMs = 864000000;
        const ms = getMsTimeFromDays(days);
        expect(ms).toBe(shouldMs);
    });

    it('[success]: getMsTimeFromDays', () => {
        const days = 10;
        const shouldMs = 864000000;
        const ms = getMsTimeFromDays(days);
        expect(ms).toBe(shouldMs);
    });

    it('[success]: trimAndLowerCase', () => {
        const val = ' TEST ';
        const should = 'test';
        const get = trimAndLowerCase(val);
        expect(get).toBe(should);
    });

    it('[success]: trimAndLowerCase with empty input', () => {
        const get = trimAndLowerCase();
        expect(get).toBe('');
    });

    it('[success]: getDomainFromEmail', () => {
        const val = 'info@scaletech.xyz';
        const domain = getDomainFromEmail(val);
        expect(domain).toBe('scaletech.xyz');
    });

    it('[success]: password generate and match', async () => {
        const pass = 'jfhdsjkfskfhjfryuw';
        const salt = await generateSaltAndHash(pass);
        const confirmPassword = await comparePassword(pass, salt.passwordHash);
        expect(confirmPassword).toBe(true);
    });

    it('[success]: addMonths', async () => {
        const date = new Date('2002/08/10');
        const months = 20;
        const ret = addMonths(months, date);
        expect(ret).toBeInstanceOf(Date);
        expect(ret.toDateString()).toBe('Sat Apr 10 2004');
    });

    it('[success]: validateJwt', () => {
        const val = {
            secret: 'SECRET',
            JWT_EXPIRES: '1000',
        };
        const sec = jwtSign(val);
        const bValue = `Bearer ${sec}`;
        const validate = validateJwt(bValue, {});
        expect(validate).toBeDefined();
        expect(validate).toBe(true);
    });

    it('[Fail]: validateJwt', () => {
        const val = {
            secret: 'SECRET',
            JWT_EXPIRES: '1000',
        };
        const sec = jwtSign(val);
        const validate = validateJwt(sec, {});
        expect(validate).toBeDefined();
        expect(validate).toBe(false);
    });

    it('[success]: assertJwt', () => {
        const val = {
            secret: 'SECRET',
            JWT_EXPIRES: '1000',
        };
        const sec = jwtSign(val);
        const bValue = `Bearer ${sec}`;
        const validate = assertJwt(bValue);
        expect(validate).toBeDefined();
        expect(validate).toBeTruthy();
        expect(typeof validate === 'object').toBe(true);
    });

    it('[fail]: assertJwt - udefined', () => {
        try {
            assertJwt();
        } catch (e) {
            expect(e).toBeInstanceOf(UnautherizationError);
        }
    });

    it('[fail]: assertJwt - no bearer', () => {
        try {
            const val = {
                secret: 'SECRET',
                JWT_EXPIRES: '1000',
            };
            const sec = jwtSign(val);
            assertJwt(sec);
        } catch (e) {
            expect(e).toBeInstanceOf(Error);
        }
    });

    it('[fail]: assertJwt - no bearer', () => {
        try {
            const val = {
                secret: 'SECRET',
                JWT_EXPIRES: '1000',
            };
            const sec = jwtSign(val);
            assertJwt(sec);
        } catch (e) {
            expect(e).toBeInstanceOf(Error);
        }
    });

    it('[fail]: assertJwt - wring jwt token', () => {
        try {
            const token =
                'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZWNyZXQiOiJTRUNSRVQiLCJKV1RfRVhQSVJFUyI6IjEwMDAiLCJpYXQiOjE2NzEwMjAxOTAsImV4cCI6MTY4MTAyMDE5MH0.jKoqlNTGmVJPMNb7ntut4X';
            assertJwt(token);
        } catch (e) {
            expect(e).toBeInstanceOf(Error);
        }
    });

    it('[success]: otpGenerator', () => {
        expect(otpGenerator(5).length).toEqual(5);
    });
});
