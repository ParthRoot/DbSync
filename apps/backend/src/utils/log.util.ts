import { ConsoleLogger, LogLevel } from '@nestjs/common';
import { yellow } from '@nestjs/common/utils/cli-colors.util';
import * as fs from 'fs';
import * as path from 'path';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const correlator = require('express-correlation-id');

export class CustomLogger extends ConsoleLogger {
    constructor(context?: string) {
        super(context ?? String(process.env['npm_package_name']));
    }

    override isLevelEnabled(_level: LogLevel): boolean {
        return true;
    }
    private _shouldWriteToTheFile = false;
    private _pathToWrite: string = __dirname;
    private _fileName = () => this.setCurrentDate();

    set pathToWrite(path: string) {
        this._pathToWrite = path;
    }

    set shouldWriteToThePath(should: boolean) {
        this._shouldWriteToTheFile = should;
    }

    /**
     * Returns the currrent date.
     * @returns string
     */
    setCurrentDate(): string {
        const date = new Date(Date.now());
        return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}.log`;
    }

    /**
     * Write messages to file.
     * @param message string
     * @returns  void
     */
    writeMessageToFile(message: string) {
        const resolvePath = path.resolve(this._pathToWrite, this._fileName());
        fs.appendFile(resolvePath, message, (err) => {
            if (err) {
                console.error(err.message, err);
                process.exit(1);
            }
        });
    }

    /**
     * Retrieves current Process/Request Correlation ID
     *   Supports context switching
     * @param pid number
     * @returns string
     */
    getProcessID(pid: number, requestId: string) {
        return `[(^)(-)] ${requestId || pid}  - `;
    }

    override printMessages(
        messages: unknown[],
        context?: string,
        logLevel: LogLevel = 'verbose',
        writeStreamType?: 'stdout' | 'stderr',
    ) {
        try {
            messages.forEach((message) => {
                const contextMessage = context ? yellow(`[${context}] `) : '';
                const timestampDiff = '';
                const formattedLogLevel = logLevel.toUpperCase().padStart(7, ' ');
                const formattedMessage = this.formatMessage(
                    logLevel,
                    message,
                    this.getProcessID(process.pid, correlator.getId()),
                    formattedLogLevel,
                    contextMessage,
                    timestampDiff,
                );
                if (this._shouldWriteToTheFile) {
                    this.writeMessageToFile(formattedMessage);
                } else {
                    try {
                        process[writeStreamType ?? 'stdout'].write(formattedMessage);
                    } catch (error) {
                        console.log(formattedMessage);
                    }
                }
            });
        } catch (error) {
            console.log(context, ...messages);
        }
    }
}

export const logger = new CustomLogger();
