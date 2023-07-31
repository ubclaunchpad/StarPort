import { APIGatewayEvent, APIGatewayProxyEvent } from 'aws-lambda';
import {
    APIError,
    APIErrorResponse,
    APIResponse,
    APIReturnResponse,
    UnsupportedEndpointError,
} from './response';
import { IMiddleware, isRouter, LambdaHandler, Router } from './types';

export class LambdaBuilder {
    private readonly entry: Router | LambdaHandler;
    private middlewares: IMiddleware[] = [];
    private cleanupFunctions: IMiddleware[] = [];

    constructor(entry: Router | LambdaHandler) {
        this.entry = entry;
    }

    async router(event: APIGatewayEvent): Promise<APIResponse> {
        if (isRouter(this.entry)) {
            const router = this.entry as Router;
            if (router[event.httpMethod.toLowerCase()] === undefined) {
                throw new UnsupportedEndpointError(
                    `Unsupported endpoint ${event.httpMethod} ${event.path}`
                );
            }

            switch (event.httpMethod) {
                case 'GET':
                    return await router.get(event);
                case 'POST':
                    return await router.post(event);
                case 'PATCH':
                    return await router.patch(event);
                case 'DELETE':
                    return await router.delete(event);
                default:
                    throw new UnsupportedEndpointError(
                        `Unsupported endpoint ${event.httpMethod} ${event.path}`
                    );
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
                for (const middleware of this.cleanupFunctions) {
                    const output = await middleware.handler(input);
                    input = { ...input, ...output };
                }
                return new APIReturnResponse(res);
            } catch (error) {
                const eventError = error as APIError;
                return new APIErrorResponse(eventError);
            }
        };
    }
}
