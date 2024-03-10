import { APIGatewayProxyEvent } from 'aws-lambda';
import { IHandlerEvent, IMiddleware } from './types';
import { LambdaInput } from './middleware';

export interface PaginationParams {
    offset: number;
    limit: number;
    count?: number;
}

export class PaginationHelper implements IMiddleware<IHandlerEvent, object> {
    deafultOffset: number;
    defaultLimit: number;

    constructor(paginationParams: PaginationParams) {
        this.deafultOffset = paginationParams.offset;
        this.defaultLimit = paginationParams.limit;
    }

    public handler = async (event: APIGatewayProxyEvent) => {
        const queryStringParameters = event.queryStringParameters || {};
        const { offset, limit } = queryStringParameters as unknown as any;

        const paginationParams = {
            offset: offset ? parseInt(offset) : this.deafultOffset,
            limit: limit ? parseInt(limit) : this.defaultLimit,
        };

        return { pagination: paginationParams };
    };
}

export class ResponseMetaTagger implements IMiddleware<IHandlerEvent, object> {
    public handler = async (event: LambdaInput) => {
        const { count, limit, offset } = event.pagination as PaginationParams;
        const res = event.data;

        return {
            data: res,
            meta: {
                offset: offset,
                limit: limit,
                total: count,
            },
        };
    };
}
