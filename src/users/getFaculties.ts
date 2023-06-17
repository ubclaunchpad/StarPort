import { APIGatewayProxyResult } from 'aws-lambda';
import { formatResponse } from '../util/util';
import { IQueryObjectResult } from '../util/types/query';
import { FACULTIES } from '../constants/userConstants';

export const handler = async function (): Promise<APIGatewayProxyResult> {
    try {
        const result = getFacultyIdsAndNames();
        return formatResponse(200, result);
    } catch (error) {
        return formatResponse(400, { message: (error as Error).message });
    }
};

export const getFacultyIdsAndNames = () => {
    return FACULTIES;
};

export interface FacultyQueryResultArray {
    faculty: IQueryObjectResult<string>;
}
