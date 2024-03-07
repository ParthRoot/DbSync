import * as httpMock from 'node-mocks-http';
import {
    createPagination,
    generateNewFilename,
    getPaginateOffset,
    getUrl,
    otpGenerator,
} from './common.util';
import { BadRequestException } from '@nestjs/common';

describe('Common util Test', () => {
    it('[success] : getUrl', async () => {
        const req = httpMock.createRequest({
            url: 'localhost',
            originalUrl: '?test=value',
            host: 'localhost',
            protocol: 'http',
            get: (prop = 'localhost') => prop,
        });
        const url = getUrl(req);
        expect(url).toBeDefined();
        expect(new URL(url)).toBeDefined();
    });

    it('[success]: otpGenerator', () => {
        expect(otpGenerator(5).length).toEqual(5);
    });

    it('[success]: getPaginateOffset', () => {
        expect(getPaginateOffset(0, 0)).toEqual({
            take: 10,
            skip: 0,
            pagenumber: 1,
        });
    });

    it('[success]: getPaginateOffset', () => {
        const result = {
            total: 0,
            record_per_page: 100,
            current_page: 10,
            total_pages: 0,
            next_page: null,
            remaining_count: 0,
            data: [1],
        };

        expect(createPagination(0, 10, 100, [1])).toEqual(result);
    });

    it('should generate an OTP of the specified length', () => {
        const length = 6; // Change the length as needed
        const otp = otpGenerator(length);

        expect(otp).toHaveLength(length);
        expect(/^\d+$/.test(otp)).toBe(true); // Check if the OTP consists of only digits
    });

    it('should generate a new filename with a valid file extension', () => {
        const fileObj = {
            originalname: 'image.jpg',
            size: 1024, // 1 KB
        };
        const maxSizeInBytes = 5 * 1024 * 1024;

        const result = generateNewFilename(fileObj, maxSizeInBytes);

        // Your assertions here, e.g., check if the result is a string and has the expected format
        expect(typeof result).toBe('string');
        expect(result).toMatch(/^[a-zA-Z0-9]+_[a-zA-Z0-9]+\.(jpg|jpeg|png|gif|bmp|svg)$/);
    });

    it('should throw a BadRequestException for an invalid file extension', () => {
        const fileObj = {
            originalname: 'document.pdf',
            size: 1024, // 1 KB
        };
        const maxSizeInBytes = 5 * 1024 * 1024;

        expect(() => generateNewFilename(fileObj, maxSizeInBytes)).toThrow(
            new BadRequestException(
                "File extension '.pdf' is not allowed. Supported extensions are .jpg, .jpeg, .png, .gif, .bmp, .svg.",
            ),
        );
    });

    it('should throw a BadRequestException for a file size exceeding the maximum', () => {
        const maxSizeInBytes = 5 * 1024 * 1024;
        const fileObj = {
            originalname: 'image.jpg',
            size: maxSizeInBytes + 1, // Exceeds the maximum allowed size
        };

        expect(() => generateNewFilename(fileObj, maxSizeInBytes)).toThrow(
            new BadRequestException(
                `File size exceeds the maximum allowed size of ${maxSizeInBytes / 1024} kb.`,
            ),
        );
    });
});
