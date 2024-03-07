import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { validateJwt } from '../index';
import { JwtPayload } from 'jsonwebtoken';
import { Request } from 'express';

export enum AvailableRoleEnum {
    SUPER_ADMIN = 'Super Admin',
    ADMIN = 'Admin',
    USER = 'User',
    MASTER = 'Master',
    AMBG_ADMIN = 'Ambg Admin',
}

export interface UserPayload extends JwtPayload {
    id: string;
    email: string;
    name: string;
}

export function handleAuthentication(req: Request) {
    const getAuthorization = req.headers['authorization'] as string;
    return validateJwt(getAuthorization, req);
}

@Injectable()
export class AuthGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest();
        const data = handleAuthentication(request);
        return data;
    }
}
