import { APIGatewayProxyResult } from 'aws-lambda/trigger/api-gateway-proxy';

export interface APIResponse extends APIGatewayProxyResult {
    statusCode: number;
    headers?:
        | {
              [header: string]: boolean | number | string;
          }
        | undefined;
    multiValueHeaders?:
        | {
              [header: string]: Array<boolean | number | string>;
          }
        | undefined;
    body: string;
    data?: object;
    isBase64Encoded?: boolean | undefined;
}

export class APIReturnResponse implements Partial<APIResponse> {
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
        'Cache-Control': 'max-age=10, private, must-revalidate',
        'Content-Type': 'application/json',
    };
    body: string;
    statusCode: number;
    constructor(returnArg: APISuccess) {
        this.body = returnArg.body || JSON.stringify(returnArg.data);
        this.statusCode = returnArg.statusCode;
    }
}

export abstract class APISuccess implements Partial<APIResponse> {
    statusCode: number;
    body: string;
    data?: object;
    protected constructor(data: object) {
        this.data = data;
    }
}

export class SuccessResponse extends APISuccess {
    statusCode = 200;
    constructor(body: object) {
        super(body);
    }
}

export class APIErrorResponse implements APIResponse {
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
    };
    body: string;
    statusCode: number;
    constructor(error: APIError) {
        this.body = JSON.stringify({
            error: {
                name: error.name,
                message: error.message,
            },
        });
        this.statusCode = error.statusCode;
    }
}

export abstract class APIError extends Error implements Partial<APIResponse> {
    statusCode: number;
    protected constructor(message: string) {
        super(message);
        this.name = 'APIError';
    }
}

class ValidationError extends APIError {
    statusCode = 400;
    constructor(message: string) {
        super(message);
        this.name = 'ValidationError';
    }
}

class NotFoundError extends APIError {
    statusCode = 404;
    constructor(message: string) {
        super(message);
        this.name = 'NotFoundError';
    }
}

class UnauthorizedError extends APIError {
    statusCode = 401;
    constructor(message: string) {
        super(message);
        this.name = 'UnauthorizedError';
    }
}

class ForbiddenError extends APIError {
    statusCode = 403;
    constructor(message: string) {
        super(message);
        this.name = 'ForbiddenError';
    }
}

class InternalError extends APIError {
    statusCode = 500;
    constructor(message: string) {
        super(message);
        this.name = 'InternalError';
    }
}

class BadRequestError extends APIError {
    statusCode = 400;
    constructor(message: string) {
        super(message);
        this.name = 'BadRequestError';
    }
}

class TimeoutError extends APIError {
    statusCode = 408;
    constructor(message: string) {
        super(message);
        this.name = 'TimeoutError';
    }
}

class UnsupportedEndpointError extends APIError {
    statusCode = 501;
    constructor(message: string) {
        super(message);
        this.name = 'UnsupportedEndpointError';
    }
}

export {
    ValidationError,
    NotFoundError,
    UnauthorizedError,
    ForbiddenError,
    InternalError,
    BadRequestError,
    TimeoutError,
    UnsupportedEndpointError,
};
