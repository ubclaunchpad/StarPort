import { APIGatewayProxyResult } from 'aws-lambda';
import { formatResponse } from '../util/util';
import { PROGRAMS } from '../constants/userConstants';

export const handler = async function (): Promise<APIGatewayProxyResult> {
    try {
        const result = getProgramIdsAndNames();
        return formatResponse(200, result);
    } catch (error) {
        return formatResponse(200, { message: (error as Error).message });
    }
};

export const getProgramIdsAndNames = async () => {
    return PROGRAMS;
};
