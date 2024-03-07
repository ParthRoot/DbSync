// // Note: do not mock decorators it is talking a lot of computation power

import { Test, TestingModule } from '@nestjs/testing';

import * as httpMock from 'node-mocks-http';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';
import { User } from './user.decorator';
import { UsersController } from '../../modules/users/users.controller';
import { UsersService } from '../../modules/users/users.service';
import { Repository } from 'typeorm';
import {
    ModuleRepository,
    PermissionRepository,
    RoleAssignedRepository,
    RoleAvailableRepository,
    RolePermissionRepository,
    UserModulePermissionRepository,
    UserRepository,
} from '../../repo';
import { AvailableRoleEnum, UserPayload } from '../guard';
import { UnautherizationError } from '../error';
import { MockType } from '../type.util';


/* -----------------------User Mock------------------------------ */
export const userMockFactory: () => MockType<Repository<UserRepository>> = jest.fn(() => ({
    findOne: jest.fn((entity) => entity),
    // ...
}));

export const userMockProvider = {
    provide: UserRepository,
    useFactory: userMockFactory,
};

/* ------------------------End user mock----------------------------- */

/* -----------------------------user role assigned------------------------------------ */
export const roleAssignMockFactory: () => MockType<Repository<RoleAssignedRepository>> = jest.fn(
    () => ({
        findOne: jest.fn((entity) => entity),
        // ...
    }),
);

export const roleAssignedMockProvider = {
    provide: RoleAssignedRepository,
    useFactory: roleAssignMockFactory,
};

/*-----------------------------end user role assined----------------------------------------------- */

/*-----------------------------user role available----------------------------------------------- */

export const roleAvailableMockFactory: () => MockType<Repository<RoleAvailableRepository>> =
    jest.fn(() => ({
        findOne: jest.fn((entity) => entity),
        // ...
    }));

export const roleAvailableMockProvider = {
    provide: RoleAvailableRepository,
    useFactory: roleAvailableMockFactory,
};

/*-----------------------------user role available----------------------------------------------- */

/*-----------------------------Start user module permission mock----------------------------------------------- */
export const userModulePermissionMockFactory: () => MockType<
    Repository<UserModulePermissionRepository>
> = jest.fn(() => ({
    findOne: jest.fn((entity) => entity),
}));

export const userModulePermissionMockProvider = {
    provide: UserModulePermissionRepository,
    useFactory: userModulePermissionMockFactory,
};
/*-----------------------------End user module permission mock----------------------------------------------- */

/*-----------------------------Start permission mock----------------------------------------------- */
export const permissionMockFactory: () => MockType<Repository<PermissionRepository>> = jest.fn(
    () => ({
        findOne: jest.fn((entity) => entity),
    }),
);

export const permissionMockProvider = {
    provide: PermissionRepository,
    useFactory: permissionMockFactory,
};
/*-----------------------------End permission mock---------------------------------------------- */

/*-----------------------------Start module mock-------------------------------------------- */
export const moduleMockFactory: () => MockType<Repository<ModuleRepository>> = jest.fn(() => ({
    findOne: jest.fn((entity) => entity),
}));

export const moduleMockProvider = {
    provide: ModuleRepository,
    useFactory: moduleMockFactory,
};
/*-----------------------------End module mock----------------------------------------------- */

/*-----------------------------Start RolePermission mock-------------------------------------------- */
export const rolePermissionMockFactory: () => MockType<Repository<RolePermissionRepository>> =
    jest.fn(() => ({
        findOne: jest.fn((entity) => entity),
    }));

export const rolePermissionMockProvider = {
    provide: RolePermissionRepository,
    useFactory: rolePermissionMockFactory,
};
/*-----------------------------End RolePermission mock----------------------------------------------- */

describe('Decorator', () => {
    let userController: UsersController;
    let user;

    function getParamDecoratorFactory(_decorator: Function) {
        class TestDecorator {
            public test(@User() _value: any) {}
        }

        const args = Reflect.getMetadata(ROUTE_ARGS_METADATA, TestDecorator, 'test');
        // @ts-ignore
        const fac = args[Object.keys(args)[0]].factory;
        return fac;
    }

    beforeEach(async () => {
        const app: TestingModule = await Test.createTestingModule({
            controllers: [UsersController],
            providers: [
                UsersService,
                userMockProvider,
                roleAssignedMockProvider,
                roleAvailableMockProvider,
                userModulePermissionMockProvider,
                permissionMockProvider,
                moduleMockProvider,
                rolePermissionMockProvider,
            ],
        }).compile();

        userController = app.get<UsersController>(UsersController);
    });

    it('[Success] : User Decorator', async () => {
        const req = httpMock.createRequest();
        const res = httpMock.createResponse();
        const mockUser: UserPayload = {
            id: 'djldjsadjlksjdlas',
            email: 'info@scaletech.xyz',
            role: AvailableRoleEnum.ADMIN,
            companyId: 2,
        };
        req['user'] = mockUser;
        const ctx = new ExecutionContextHost(
            [req, res],
            userController as any,
            userController.getUserProfile,
        );
        const factory = getParamDecoratorFactory(User);
        user = factory(null, ctx);
        const usD = await userController.getUserProfile(user, mockUser);
        expect(usD).toHaveProperty('data');
        expect(usD).toHaveProperty('message');
    });

    it('[Fail] : User Decorator', async () => {
        try {
            const req = httpMock.createRequest();
            const res = httpMock.createResponse();
            const ctx = new ExecutionContextHost(
                [req, res],
                userController as any,
                userController.getUserProfile,
            );
            const factory = getParamDecoratorFactory(User);
            user = factory(null, ctx);
            const mockUser: UserPayload = {
                id: 'djldjsadjlksjdlas',
                email: 'info@scaletech.xyz',
                role: AvailableRoleEnum.ADMIN,
                companyId: 2,
            };
            await userController.getUserProfile(user, mockUser);
        } catch (e) {
            expect(e).toBeInstanceOf(UnautherizationError);
        }
    });
});
