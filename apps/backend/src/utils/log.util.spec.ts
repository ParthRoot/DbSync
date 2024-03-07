import { logger } from './log.util';
import fs from 'fs/promises';

describe('setCurrentDate', () => {
    it('setCurrentDate get file name', () => {
        const date = new Date(Date.now());
        expect(logger.setCurrentDate()).toEqual(
            `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}.log`,
        );
    });
});

describe('set values', () => {
    it('set value pathToWrite', () => {
        logger.pathToWrite = 'sjfkjdksadj';
    });

    it('set value shouldWriteToThePath', () => {
        logger.shouldWriteToThePath = true;
    });
});

describe('writeMessageToFile', () => {
    it('execute writeMessageToFile function', async () => {
        logger.writeMessageToFile('hello');
    });
});

describe('writeMessageToFile', () => {
    it('handles error during file appending', async () => {
        // Create an instance of CustomLogger (or use the existing logger instance)

        // Mock fs.appendFile to simulate an error
        jest.spyOn(fs, 'appendFile').mockRejectedValue(
            new Error('Mocked error during file appending'),
        );

        // The message you want to write
        const message = 'This is a test message';

        // Call the writeMessageToFile function
        logger.writeMessageToFile(message);

        // Clean up the mock
        jest.restoreAllMocks();
    });
});
