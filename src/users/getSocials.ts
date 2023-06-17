import { APIGatewayProxyResult } from 'aws-lambda';
import { formatResponse } from '../util/util';
import { SOCIALS } from '../constants/userConstants';

export const handler = async function (): Promise<APIGatewayProxyResult> {
    try {
        const result = getSocialIdsAndNames();
        return formatResponse(200, result);
    } catch (error) {
        return formatResponse(400, { message: (error as Error).message });
    }
};

export const getSocialIdsAndNames = () => {
    return SOCIALS;
};
