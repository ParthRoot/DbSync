import * as crypto from 'crypto';
import { compare, genSaltSync, hash } from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { getEnv } from './env.util';
import DateMoment from 'moment';
import { UnautherizationError } from './error';
import { UserPayload } from './guard/auth.guard';
import { messages } from '../lang/api-messages';
import { BadRequestException } from '@nestjs/common';

/**
 * It returns the md5 hash of the given string
 * @param str string to be hashed
 * @returns hashed string
 */
export const md5 = (str: string) => {
    return crypto.createHash('md5').update(str).digest('hex');
};

export interface PostgresSortParams {
    limit?: number;
    offset?: number;
    orders?: {
        order: 'asc' | 'desc';
        orderColumn: string;
    }[];
}

export interface PostgresCompareSchema {
    key: string;
    isWildCard?: boolean;
    customCheck?: string;
    customQuery?: string;
    value: string | number | boolean | null;
}

export interface PostgresSearchParams {
    or?: PostgresCompareSchema[];
    and?: PostgresCompareSchema[];
    joinBothWith?: 'or' | 'and';
}

export interface JwtPayload {
    uid: string;
}

export interface Sha512Interface {
    salt: string;
    passwordHash: string;
}

export interface IVerifyEmailAndForgotPasswordTokenPayload {
    email: string;
    userId: string;
}

export const jwtRefreshSign = (data: object) => {
    return jwt.sign(data, getEnv('JWT_REFRESH_SALT', 'secret'), {
        algorithm: 'HS256',
        expiresIn: '365d', //getEnv('JWT_REFRESH_TOKEN_EXPIRES', '365 days'),
    });
};

export const jwtSign = (data: object) => {
    return jwt.sign(data, getEnv('JWT_SALT', 'secret'), {
        algorithm: 'HS256',
        expiresIn: parseInt(getEnv('JWT_EXPIRES', '10000')) * 1000, // unix seconds
    });
};

export const jwtSignForEmailVerificationAndForgotPassword = (data: object) => {
    return jwt.sign(data, getEnv('JWT_SALT_FOR_EMAIL_VERIFICATION_AND_FORGOT_PASSWORD', 'secret'), {
        algorithm: 'HS256',
        // expiresIn: parseInt(getEnv('EMAIL_VERIFICATION_TOKEN_EXPIRE_SECONDS', '86400')),
        expiresIn: parseInt(getEnv('JWT_EXPIRES', '10000')) * 1000, // unix seconds
    });
};

export const tokeVerifyForEmailVerificationAndForgotPassword = (token: string) => {
    try {
        const decodedToken = jwt.verify(
            token,
            getEnv('JWT_SALT_FOR_EMAIL_VERIFICATION_AND_FORGOT_PASSWORD', 'secret'),
            {
                algorithms: ['HS256'],
            },
        );

        return decodedToken;
    } catch (error: any) {
        if (error.name === 'TokenExpiredError') {
            throw new BadRequestException(messages.tokenExpires);
        } else {
            throw new Error('Invalid token');
        }
    }
};

export const jwtVerify = (token: string) => {
    return jwt.verify(token, getEnv('JWT_SALT', 'secret'), {
        algorithms: ['HS256'],
    });
};

export const generateRandomString = (length: number) => {
    const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
    const digitChars = '0123456789';
    const specialChars = '@#$%&';

    let randomString = '';

    // Add at least one uppercase letter
    randomString += uppercaseChars[Math.floor(Math.random() * uppercaseChars.length)];

    // Add at least one lowercase letter
    randomString += lowercaseChars[Math.floor(Math.random() * lowercaseChars.length)];

    // Add at least one digit
    randomString += digitChars[Math.floor(Math.random() * digitChars.length)];

    // Add at least one special character
    randomString += specialChars[Math.floor(Math.random() * specialChars.length)];

    // Generate the remaining characters
    for (let i = 4; i < length; i++) {
        const charset = uppercaseChars + lowercaseChars + digitChars + specialChars;
        randomString += charset[Math.floor(Math.random() * charset.length)];
    }

    return randomString
        .split('')
        .sort(() => 0.5 - Math.random())
        .join(''); // Shuffle characters
};

export const otpGenerator = (length: number) => {
    const characters = '0123456789';

    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
};

export function getMsTimeFromDays(days: number) {
    return days * 24 * 60 * 60 * 1000;
}

export function trimAndLowerCase(value = '') {
    return `${String(value)}`.trim().toLowerCase();
}

export function getDomainFromEmail(email: string) {
    return String(email)
        .substring(email.lastIndexOf('@') + 1)
        .trim()
        .toLowerCase();
}

/**
 * compares plain password and password hash, and validates if both are same or not
 * it not same, throws an error, else resolves  true
 * @param plainPassword plain password received in requets body
 * @param passwordhash
 */
export async function comparePassword(plainPassword: string, passwordhash: string) {
    const isMatched = await compare(plainPassword, passwordhash);
    return isMatched;
}

/**
 * returns hash of password
 * @param plainPassword - plain password
 * @param salt - salt
 */
export async function makeHash(plainPassword: string, salt: string): Promise<string | null> {
    return await hash(plainPassword, salt);
}

/**
 * generates salt of password
 * @param round - number of rounds (defaults to 10)
 */
export async function generateSalt(round = 10) {
    return genSaltSync(round);
}

/**
 * returns generated salt and hash of user's plain password0
 * @param userPassword - user's password
 */
export async function generateSaltAndHash(userPassword: string): Promise<Sha512Interface> {
    const salt = await generateSalt();
    /** Gives us salt of length 16 */
    const passwordHash: string = (await makeHash(userPassword, salt)) as string;
    return {
        salt,
        passwordHash,
    };
}

export const addMonths = (months: number, date: Date) => {
    return DateMoment(date).add(months, 'M').toDate();
};

export const validateJwt = (token: string, requ: any) => {
    try {
        const data = assertJwt(token);
        requ['user'] = data;
        return true;
    } catch (e) {
        return false;
    }
};

export const assertJwt = (token?: string) => {
    try {
        if (!token)
            throw new UnautherizationError('Authorization is required for user validation.');
        if (token.includes('Bearer') === false) {
            throw new Error('Authorization should be "Bearer".');
        }
        const splitBearer = token.split(' ')[1];
        const jwt = jwtVerify(String(splitBearer)) as UserPayload | undefined;
        return jwt;
    } catch (e) {
        if (e instanceof jwt.JsonWebTokenError) {
            throw new Error('Token could not be parsed.');
        }
        throw e;
    }
};
