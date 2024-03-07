import { jwtSign } from '../crypt.util';
import { AuthGuard } from './auth.guard';

describe('Role Guard', () => {
    const val = {
        secret: 'SECRET',
        JWT_EXPIRES: '1000',
    };
    const sec = jwtSign(val);
    const request: any = {
        switchToHttp: () => ({
            getRequest: () => ({
                headers: {
                    authorization: 'Bearer ' + sec,
                },
            }),
        }),
    };

    it('will check the role guard', () => {
        const auth = new AuthGuard();
        const is = auth.canActivate(request);
        expect(is).toBeDefined();
        expect(is).toBe(true);
    });
});
