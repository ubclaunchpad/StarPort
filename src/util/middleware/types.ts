import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { APIResponse } from './response';

export type LambdaHandler = (
    event: APIGatewayProxyEvent,
    context?: any
) => Promise<APIGatewayProxyResult>;

export interface IMiddleware<T = IHandlerEvent, P = any> {
    inputMapper?: (event: T) => Promise<T>;
    handler: (event: T) => Promise<P>;
    outputMapper?: (event: T, output: P) => Promise<P>;
}
export type IHandlerEvent = APIGatewayProxyEvent;

export interface ISchemaValidator {
    inputSchema?: object;
    outputSchema?: object;
    validate: (event: IHandlerEvent) => Promise<void>;
}

export type Router = {
    get?: (any) => Promise<APIResponse>;
    post?: (any) => Promise<APIResponse>;
    patch?: (any) => Promise<APIResponse>;
    delete?: (any) => Promise<APIResponse>;
    put?: (any) => Promise<APIResponse>;
};

export function isRouter(router: Router | LambdaHandler): router is Router {
    if (typeof router === 'function') {
        return false;
    }

    return (
        router.get !== undefined ||
        router.post !== undefined ||
        router.patch !== undefined ||
        router.delete !== undefined ||
        router.put !== undefined
    );
}
