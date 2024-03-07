import { BadRequestException } from '@nestjs/common';
import { Request } from 'express';
import path from 'path';

interface PaginationOffset {
    limit: number;
    offset: number;
    pagenumber: number;
}

/**
 * Construct a complete URL including protocol, host, and optional suffix.
 *
 * @param req - The request object.
 * @param suffix - Optional suffix to append to the URL.
 * @returns The complete URL string.
 */
export function getUrl(req: Request, suffix = '') {
    return `${req.protocol}://${req.get('Host')}${req.originalUrl}${suffix}`;
}

/**
 * Create a URL-friendly slug from the input string.
 *
 * @param input - The input string to be transformed into a slug.
 * @returns The URL-friendly slug.
 */
export function createSlug(input: string): string {
    return input
        .toLowerCase()
        .replace(/ /g, '-') // Replace spaces with dashes
        .replace(/[^\w-]+/g, ''); // Remove non-word characters except dashes
}

/**
 * Generate an OTP (One-Time Password) of the specified length.
 *
 * @param length - The length of the OTP.
 * @returns The generated OTP.
 */
export function otpGenerator(length: number) {
    const characters = '0123456789';

    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
}

/**
 * Create pagination offset
 * @param {number} pageNumber
 * @param {number} recordPerPage
 * @return {PaginationOffset} PaginationOffset
 */
export function getPaginateOffset(pageNumber: number, recordPerPage: number): PaginationOffset {
    const pagenumber = pageNumber ? Number(pageNumber) : 1;
    const limit = recordPerPage ? Number(recordPerPage) : 1000000;
    const offset = (pagenumber - 1) * limit;

    return { limit, offset, pagenumber };
}

/**
 * Create pagination information based on total records, current page, record per page, and data.
 *
 * @param totalRecord - The total number of records.
 * @param pageNumber - The current page number.
 * @param recordPerPage - The number of records to display per page.
 * @param data - The data to be paginated.
 * @returns An object containing pagination details and the paginated data.
 */
export function createPagination(
    totalRecord: number,
    pageNumber: number,
    recordPerPage: number,
    data: any,
) {
    let remainingCount = totalRecord - ((pageNumber - 1) * recordPerPage + data.length);
    remainingCount = remainingCount >= 0 ? remainingCount : 0;
    const result = {
        paginationData: {
            total: totalRecord,
            recordPerPage: recordPerPage,
            currentPage: pageNumber,
            totalPages: Math.ceil(totalRecord / recordPerPage),
            nextPage: remainingCount ? pageNumber + 1 : null,
            remainingCount: remainingCount,
        },
        data,
    };
    return result;
}

/**
 * Generates a new filename for an uploaded file based on the original filename.
 * @param fileObj The uploaded file object.
 * @param maxSizeInBytes The maximum allowed file size in bytes.
 * @returns A new filename.
 */
export function generateNewFilename(fileObj: any, maxSizeInBytes: number): string {
    const name = fileObj.originalname.replace(/\s+/g, '').split('.')[0];
    const ext = path.extname(fileObj.originalname);

    validateImageFileExtension(ext);
    checkFileSize(fileObj.size, maxSizeInBytes);

    const randomName = generateRandomName(6);
    return `${name}_${randomName}${ext}`;
}

/**
 * Validates the file extension of an uploaded file.
 * @param ext The file extension to validate.
 * @throws BadRequestException if the file extension is not supported.
 */
export function validateImageFileExtension(ext: string): void {
    const allowedFileExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg'];
    if (!allowedFileExtensions.includes(ext.toLowerCase())) {
        throw new BadRequestException(
            `File extension '${ext}' is not allowed. Supported extensions are ${allowedFileExtensions.join(
                ', ',
            )}.`,
        );
    }
}

/**
 * Checks if the file size exceeds the maximum allowed size.
 * @param fileSizeInBytes The file size in bytes to check.
 * @param maxSizeInBytes The maximum allowed file size in bytes.
 * @throws BadRequestException if the file size exceeds the maximum allowed size.
 */
export function checkFileSize(fileSizeInBytes: number, maxSizeInBytes: number): void {
    if (fileSizeInBytes > maxSizeInBytes) {
        throw new BadRequestException(
            `File size exceeds the maximum allowed size of ${maxSizeInBytes / 1024} kb.`,
        );
    }
}

/**
 * Generates a random name of the specified length.
 * @param length The length of the random name.
 * @returns A random name.
 */
export function generateRandomName(length: number): string {
    return Array(length)
        .fill(null)
        .map(() => Math.round(Math.random() * 16).toString(16))
        .join('');
}
