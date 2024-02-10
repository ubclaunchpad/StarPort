import { APIGatewayProxyEvent } from 'aws-lambda';
import {
    APIError,
    APIErrorResponse,
    APIResponse,
    APIReturnResponse,
    UnsupportedEndpointError,
} from './response';
import { IMiddleware, LambdaHandler, Router, isRouter } from './types';

export interface LambdaInput extends APIGatewayProxyEvent {
    [key: string]: unknown;
}
export class LambdaBuilder {
    private readonly entry: Router | LambdaHandler;
    private middlewares: IMiddleware[] = [];
    private cleanupFunctions: IMiddleware[] = [];

    constructor(entry: Router | LambdaHandler) {
        this.entry = entry;
    }

    async router(event: LambdaInput): Promise<APIResponse> {
        if (isRouter(this.entry)) {
            const router = this.entry as Router;
            const method = event.httpMethod.toLowerCase();

            if (router[method] === undefined) {
                throw new UnsupportedEndpointError(
                    `Unsupported endpoint ${event.httpMethod} ${event.path}`
                );
            }

            if (typeof router[method] !== 'function') {
                throw new UnsupportedEndpointError(
                    `Unsupported endpoint ${event.httpMethod} ${event.path}`
                );
            }

            try {
                return await router[method](event);
            } catch (err) {
                return new APIErrorResponse(err);
            }
        } else {
            const lambda = this.entry as LambdaHandler;
            return await lambda(event);
        }
    }

    public use(middleware: IMiddleware) {
        this.middlewares.push(middleware);
        return this;
    }

    public useAfter(middleware: IMiddleware) {
        this.cleanupFunctions.push(middleware);
        return this;
    }

    public build(): LambdaHandler {
        return async (event: APIGatewayProxyEvent) => {
            try {
                let input = event;
                for (const middleware of this.middlewares) {
                    const output = await middleware.handler(input);
                    input = { ...input, ...output };
                }
                const res = await this.router(input);

                input = { ...input, ...{ data: res.data } };
                let finalOutput = res.data;
                for (const middleware of this.cleanupFunctions) {
                    const output = await middleware.handler(input);
                    input = { ...input, ...output };
                    finalOutput = output;
                }
                res.data = finalOutput;
                res.body = JSON.stringify(res.data);
                return new APIReturnResponse(res);
            } catch (error) {
                const eventError = error as APIError;
                return new APIErrorResponse(eventError);
            }
        };
    }
}
