import { getEnv } from './env.util';
import { S3Util } from './s3.util';
describe('S3Util', () => {
    const s3BucketName = getEnv('AWS_S3_BUCKET_NAME');
    let s3: S3Util;

    beforeEach(() => {
        s3 = new S3Util();
    });

    it('will get the bucket name', () => {
        const bN = s3.bucket;
        expect(bN).toBeDefined();
        expect(typeof bN === 'string').toBe(true);
    });

    it('will set the bucket name', () => {
        s3.bucket = 'test-bucket';
        const bN = s3.bucket;
        expect(bN).toBeDefined();
        expect(typeof bN === 'string').toBe(true);
        expect(bN).toBe('test-bucket');
    });

    it('will get the presign url of uploaded file to download', () => {
        const key = 'file.obj';
        const value = s3.getObjectPreSignUrl(key);
        expect(value).toBeDefined();
        expect(typeof value === 'string').toBe(true);
        expect(value.includes('https')).toBe(true);
    });

    it('will get the presign url to upload file', () => {
        const key = 'file.obj';
        const value = s3.getPreSignedUploadRequestData(key);
        expect(value).toBeDefined();
        expect(value.url).toBeDefined();
        expect(typeof value.url === 'string').toBe(true);
        expect(value.fields).toBeDefined();
        expect(typeof value.fields === 'object').toBe(true);
    });

    it('will get the client', () => {
        const value = s3.client;
        expect(value).toBeDefined();
    });

    it('will delete the file', async () => {
        let bucketData = {
            Bucket: s3BucketName,
            Key: 'test.png',
        };
        const s3DeleteFile = {
            value: {
                deleteObject: jest.fn((param, callback) => {
                    callback(null, { ...param });
                }),
            },
        };

        Object.defineProperty(s3, '_client', s3DeleteFile);
        await expect(s3.deleteFile('test.png')).resolves.toEqual(bucketData);
    });

    it('will get the file info', () => {
        const s3GetFileInfo = {
            value: {
                getFileInfo: jest.fn(() => ({
                    status: false,
                    fileSize: 0,
                })),
            },
        };

        Object.defineProperty(s3, '_client', s3GetFileInfo);
        const res = s3.getFileInfo('test.png');
        res.then((data) => {
            expect(data).toEqual({
                status: false,
                fileSize: 0,
            });
        });
    });

    it('will get the file info with headObject aws function', async () => {
        const s3GetFileInfo = {
            value: {
                headObject: jest.fn().mockReturnThis(),
                promise: jest.fn().mockResolvedValue({
                    ContentLength: 0,
                }),
            },
        };

        Object.defineProperty(s3, '_client', s3GetFileInfo);
        const res = await s3.getFileInfo('test.png');
        expect(res).toEqual({
            status: true,
            fileSize: 0,
        });
    });

    it('will downlod the file', () => {
        const readFile = {
            value: {
                getObject: jest.fn(() => true),
            },
        };

        Object.defineProperty(s3, '_client', readFile);
        const res = s3.readFile('test.png');
        res.then((data) => {
            expect(data).toBeTruthy();
        });
    });

    it('will get the default profile pic', () => {
        const res = s3.getDeaultProfilePic();
        expect(typeof res === 'string').toBe(true);
    });

    it('[fail] : readFile', async () => {
        const getObject = {
            value: {
                getObject: jest.fn((param, callback) => {
                    callback(new Error(), { ...param });
                }),
            },
        };

        Object.defineProperty(s3, '_client', getObject);
        await expect(s3.readFile('test.png')).rejects.toThrow(Error);
    });

    it('[fail] : readFile body is undefined', async () => {
        const getObject = {
            value: {
                getObject: jest.fn((param, callback) => {
                    callback(null, { ...param, id: 1, Body: undefined });
                }),
            },
        };

        Object.defineProperty(s3, '_client', getObject);
        await expect(s3.readFile('test.png')).rejects.toEqual('Body is undefined');
    });

    it('[Success] : readFile body has value', async () => {
        let obj = { id: 123 };
        let data = Buffer.from(JSON.stringify(obj), 'utf8');
        const getObject = {
            value: {
                getObject: jest.fn((param, callback) => {
                    callback(null, { ...param, Body: data });
                }),
            },
        };

        Object.defineProperty(s3, '_client', getObject);
        await expect(s3.readFile('test.png')).resolves.toEqual(obj);
    });

    it('[Success] : uploadFile', async () => {
        const uploadFile = {
            value: {
                putObject: jest.fn().mockReturnThis(),
                promise: jest.fn().mockResolvedValue({}),
            },
        };

        Object.defineProperty(s3, '_client', uploadFile);
        const res = await s3.uploadFile('file', 'test.png');
        expect(res).toEqual(`s3://${s3BucketName}/test.png`);
    });

    it('[fail] : error in uploadFile', async () => {
        const uploadFile = {
            value: {
                putObject: jest.fn().mockReturnThis(),
                promise: jest.fn().mockRejectedValue(new Error('Upload failed')),
            },
        };

        Object.defineProperty(s3, '_client', uploadFile);
        await expect(s3.uploadFile('file', 'test.png')).rejects.toThrow(Error);
    });

    it('[Success] listOfFiles', async () => {
        const input = {
            Contents: [
                {
                    Key: 'object-key-1',
                    LastModified: '2023-08-28T12:34:56Z',
                },
                {
                    Key: 'object-key-2',
                    LastModified: '2023-08-27T10:20:30Z',
                },
            ],
        };

        const listOfFiles = {
            value: {
                listObjects: jest.fn(({}, callback) => {
                    callback(null, { ...input });
                }),
            },
        };

        Object.defineProperty(s3, '_client', listOfFiles);
        await expect(s3.listOfFiles('test.png')).resolves.toEqual(
            input.Contents.map((obj) => obj.Key),
        );
    });

    it('[fail] listOfFiles throw error', async () => {
        const listOfFiles = {
            value: {
                listObjects: jest.fn(({}, callback) => {
                    callback(new Error(), {});
                }),
            },
        };

        Object.defineProperty(s3, '_client', listOfFiles);
        await expect(s3.listOfFiles('test.png')).rejects.toThrow(Error);
    });

    it('[fail] listOfFiles Contents Undefined', async () => {
        const input = {
            Contents: undefined,
        };

        const listOfFiles = {
            value: {
                listObjects: jest.fn(({}, callback) => {
                    callback(null, { ...input });
                }),
            },
        };

        Object.defineProperty(s3, '_client', listOfFiles);
        await expect(s3.listOfFiles('test.png')).rejects.toEqual(
            'Contents of this s3 folder are undefined.',
        );
    });

    it('[success]: upload file in s3 s3Upload', async () => {
        const s3GetFileInfo = {
            value: {
                upload: jest.fn().mockReturnThis(),
                promise: jest.fn().mockResolvedValue({
                    Location: 'Location',
                    Key: 'Key',
                }),
            },
        };

        Object.defineProperty(s3, '_client', s3GetFileInfo);
        const res = await s3.s3Upload('test.png', 'any', 'any');
        expect(res).toEqual({
            fileUrl: 'Location',
            filePath: 'Key',
        });
    });

    it('[success]: upload file in s3 s3Upload with folder name', async () => {
        const s3GetFileInfo = {
            value: {
                upload: jest.fn().mockReturnThis(),
                promise: jest.fn().mockResolvedValue({
                    Location: 'Location',
                    Key: 'Key',
                }),
            },
        };

        Object.defineProperty(s3, '_client', s3GetFileInfo);
        const res = await s3.s3Upload('test.png', 'any', 'any', 'folder');
        expect(res).toEqual({
            fileUrl: 'Location',
            filePath: 'Key',
        });
    });

    it('[fail]: error upload file in s3 s3Upload with folder name', async () => {
        const s3GetFileInfo = {
            value: {
                upload: jest.fn().mockReturnThis(),
                promise: jest.fn().mockRejectedValue(new Error()),
            },
        };

        Object.defineProperty(s3, '_client', s3GetFileInfo);
        await expect(s3.s3Upload('test.png', 'any', 'any', 'folder')).rejects.toThrow(Error);
    });
});
