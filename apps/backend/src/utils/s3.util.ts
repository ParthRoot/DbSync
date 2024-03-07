import { Injectable } from '@nestjs/common';
import { Credentials, S3 } from 'aws-sdk';
import { getEnv, logger } from './index';

@Injectable()
export class S3Util {
    private _bucket: string;
    private readonly ttl: string;
    private readonly _client: S3;

    constructor() {
        this._bucket = getEnv('AWS_S3_BUCKET_NAME');
        this.ttl = getEnv('AWS_S3_FILE_UPLOAD_TTL', '5825');
        this._client = this.s3Config();
    }

    get client() {
        return this._client;
    }

    get bucket() {
        return this._bucket;
    }

    set bucket(bucketName: string) {
        this._bucket = bucketName;
    }

    private s3Config() {
        return new S3({
            credentials: new Credentials(
                getEnv('AWS_ACCESS_KEY_ID'),
                getEnv('AWS_SECRET_ACCESS_KEY'),
            ),
            region: getEnv('AWS_S3_REGION'),
        });
    }

    getPreSignedUploadRequestData($key: string) {
        const proKey = $key.replace(`s3://${this._bucket}/`, '');
        return this._client.createPresignedPost({
            Bucket: this._bucket,
            Fields: {
                Key: proKey,
            },
            Conditions: [['starts-with', '$key', proKey]],
            Expires: parseInt(this.ttl),
        });
    }

    preSignUrl(fileKey: string, bucket: string, fileName?: string) {
        const file = fileName ? `filename="${fileName}"` : '';
        const link = this._client.getSignedUrl('getObject', {
            Bucket: bucket,
            Key: fileKey.replace(`s3://${bucket}/`, ''),
            Expires: Number(this.ttl),
            ResponseContentDisposition: `attachment; ${file}`,
        });
        return link;
    }

    getObjectPreSignUrl(fileKey: string) {
        const link = this.preSignUrl(fileKey, this._bucket);
        return link;
    }

    /**
     * It will delete the files from the s3 bucket
     * @param key string
     * @returns Promise<S3.DeletedObject>
     */
    public async deleteFile($key: string): Promise<S3.DeletedObject> {
        return new Promise((resolve, reject) => {
            this._client.deleteObject(
                {
                    Bucket: this._bucket,
                    Key: $key.replace(`s3://${this._bucket}/`, ''),
                },
                (err, data) => {
                    if (err) reject(err);
                    resolve(data);
                },
            );
        });
    }

    public async getFileInfo($key: string) {
        try {
            const result = await this._client
                .headObject({
                    Bucket: this._bucket,
                    Key: $key.replace(`s3://${this._bucket}/`, ''),
                })
                .promise();
            return {
                status: true,
                fileSize: result.ContentLength,
            };
        } catch (e) {
            return {
                status: false,
                fileSize: 0,
            };
        }
    }

    /**
     * Read the file from bucket and returns the parsed json
     * @param key String
     * @returns Promise<Object<any>>
     */
    async readFile($key: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this._client.getObject(
                {
                    Bucket: this._bucket,
                    Key: $key.replace(`s3://${this._bucket}/`, ''),
                },
                (err, data) => {
                    if (err) {
                        return reject(err);
                    }

                    if (!data.Body) {
                        return reject('Body is undefined');
                    }
                    return resolve(data.Body);
                },
            );
        });
    }

    public getDeaultProfilePic() {
        return `s3://${this._bucket}/default.png`;
    }

    public async uploadFile(file: any, $key: string) {
        try {
            const bucket = this._bucket;
            await this._client.putObject({ Bucket: bucket, Key: $key, Body: file }).promise();
            return `s3://${bucket}/${$key}`;
        } catch (err) {
            logger.error(err, 's3 upload file error');
            throw err;
        }
    }

    /**
     * get list of objects
     */

    public async listOfFiles(folder: string) {
        return new Promise((resolve, reject) => {
            const params = {
                Bucket: this._bucket,
                Delimiter: '/',
                Prefix: folder.replace(`s3://${this._bucket}/`, '') + '/',
            };

            this._client.listObjects(params, (err, data) => {
                if (err) {
                    reject(err);
                }

                if (!data.Contents) {
                    reject('Contents of this s3 folder are undefined.');
                    return;
                }

                const list = data.Contents.map((obj) => obj.Key);

                if (!list) {
                    reject('list is undefined.');
                    return;
                }

                resolve(list);
            });
        });
    }

    /**
     * Upload images on aws s3
     * @param fileBuffer
     * @param filename
     * @param mimetype
     * @returns
     */
    public async s3Upload(
        fileBuffer: any,
        filename: string,
        mimetype: string,
        folderName?: string,
    ): Promise<{ fileUrl: string; filePath: string }> {
        const bucket = folderName ? `${this._bucket}/${folderName}` : this._bucket;

        const params: S3.PutObjectRequest = {
            Bucket: bucket,
            Key: filename,
            Body: fileBuffer,
            ContentType: mimetype,
            ContentDisposition: 'inline',
        };

        try {
            const { Location, Key } = await this._client.upload(params).promise();
            const fileResponseObject = {
                fileUrl: Location,
                filePath: Key,
            };
            return fileResponseObject;
        } catch (error: any) {
            throw new Error(`Failed to upload file to S3: ${error.message}`);
        }
    }

    /**
     * it will get s3 presign url
     * @param bucket
     * @param key
     * @param expires
     * @returns
     */
    getS3SignedUrlForUpload = async (bucket: string, key: string, expires: number) => {
        const url = await this._client.getSignedUrlPromise('putObject', {
            Bucket: bucket,
            Key: key,
            Expires: expires,
        });

        return url;
    };
}
