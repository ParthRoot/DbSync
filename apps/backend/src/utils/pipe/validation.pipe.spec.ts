import { ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsString, ValidateNested } from 'class-validator';
import { ValidationPipe } from './validation.pipe';
import * as cla from 'class-transformer';
import * as cv from 'class-validator';


describe('Validation', () => {
    const validationsPipe = new ValidationPipe();

    it('[fail] : will test the dto', async () => {
        class TestDto {
            @IsString()
            path!: string;
        }
        const metadata: ArgumentMetadata = {
            type: 'body',
            metatype: TestDto,
            data: '',
        };

        validationsPipe.transform(<TestDto>{}, metadata).catch((er) => {
            expect(er).toBeInstanceOf(BadRequestException);
        });
    });

    it('[success] : will test the dto', async () => {
        class TestDto {
            @IsString()
            path!: string;
        }
        const metadata: ArgumentMetadata = {
            type: 'body',
            metatype: TestDto,
            data: '',
        };

        const data: TestDto = {
            path: 'path',
        };

        const re = await validationsPipe.transform(data, metadata);
        expect(re).toEqual(data);
    });

    it('[fail] : nested property', async () => {
        class NestTestDto {
            @IsNumber()
            value!: number;
        }

        class TestDto {
            @IsString()
            path!: string;

            @Type(() => NestTestDto)
            @IsArray()
            @ValidateNested({ each: true })
            child!: NestTestDto[];
        }

        const metadata: ArgumentMetadata = {
            type: 'body',
            metatype: TestDto,
            data: '',
        };

        const data = {
            path: 'path',
            child: {
                value: '',
            },
        };

        validationsPipe.transform(data, metadata).catch((e) => {
            expect(e).toBeInstanceOf(BadRequestException);
            if (e instanceof BadRequestException) {
                expect(e.message).toBe('child must be an array');
            }
        });
    });

    it('[fail] : nested property', async () => {
        class NestTestDto {
            @IsNumber()
            value!: number;
        }

        class TestDto {
            @IsString()
            path!: string;

            @Type(() => NestTestDto)
            @IsArray()
            @ValidateNested({ each: true })
            child!: NestTestDto[];
        }

        const metadata: ArgumentMetadata = {
            type: 'body',
            metatype: TestDto,
            data: '',
        };

        const data: TestDto = {
            path: 'path',
            child: [
                {
                    value: 1,
                },
            ],
        };

        const v = await validationsPipe.transform(data, metadata);
        expect(v).toEqual(data);
    });

    it('[fail] : metatype not provided', async () => {
        const metadata: ArgumentMetadata = {
            type: 'body',
            metatype: undefined,
            data: '',
        };

        const data: any = {
            path: 'path',
        };

        const res = await validationsPipe.transform(data, metadata);
        expect(res).toEqual(data);
    });

    it('[success] : metatype be undefined', async () => {
        class TestDto {
            @IsString()
            path!: string;
        }
        const metadata: ArgumentMetadata = {
            type: 'body',
            metatype: undefined,
            data: '',
        };

        const data: TestDto = {
            path: 'path',
        };

        const re = await validationsPipe.transform(data, metadata);
        expect(re).toEqual(data);
    });

    it('[fail] : plainToInstance throws error', async () => {

        class Person {
            name!: string;
            age!: number;
        }

        const data = {
            title: 'Mr.',
            years: 30
        };
        const metadata: ArgumentMetadata = {
            type: 'body',
            metatype: Person,
            data: '',
        };

        await expect(validationsPipe.transform(data, metadata)).rejects.toThrowError(BadRequestException);
    });

    it('error object has nested error with children property.', async () => {
        // Mock plainToInstance to throw an error
        const errorObj = [
            {
              "property": "section_type",
              "children": [
                {
                  "property": "versionId",
                  "children": [],
                  "constraints": {
                    "isUuid": "versionId must be a UUID"
                  }
                }
              ],
              "constraints": {}
            }
        ];
        jest.spyOn(cv, 'validate').mockImplementation(() => Promise.resolve(errorObj));

        class TestDto {
            @IsString()
            path!: string;
        }
        const metadata: ArgumentMetadata = {
            type: 'body',
            metatype: TestDto,
            data: '',
        };

        const data: TestDto = {
            path: 'path',
        };

        expect(validationsPipe.transform(data, metadata)).rejects.toThrowError(BadRequestException);
        jest.clearAllMocks();
    });

    it('[fail] : should throw BadRequestException when plainToInstance throws an error', () => {
        // Mock plainToInstance to throw an error
        jest.spyOn(cla, 'plainToInstance').mockImplementation(() => {
            throw new Error('Mocked plainToInstance error');
        });

        const inputData = {
            path: 'path',
        };

        class TestDto {
            url!: string;
            id!: string;
        }

        const metadata: ArgumentMetadata = {
            type: 'body',
            metatype: TestDto,
            data: '',
        };

        expect(validationsPipe.transform(inputData, metadata)).rejects.toThrow(BadRequestException);
    });
});


