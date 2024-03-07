import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UnautherizationError } from '../error';
import { UserPayload } from '../guard';

export const User = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    if (!request.user) throw new UnautherizationError(`User is not provided.`);
    return request.user as UserPayload;
});
