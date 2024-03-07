import EventEmitter from 'events';
import * as httpMock from 'node-mocks-http';
import { RequestLoggerMiddleware } from './RequestLogger.middleware';
describe('Request logger', () => {
    const re = new RequestLoggerMiddleware();

    it('will log the request', () => {
        const req = httpMock.createRequest();
        const res = httpMock.createResponse({
            eventEmitter: EventEmitter,
        });
        re.use(req, res, () => {});
    });

    it('handleReponseFinish', () => {
        re.handleReponseFinish(
            httpMock.createResponse(),
            httpMock.createRequest(),
            performance.now(),
        );
    });
});
