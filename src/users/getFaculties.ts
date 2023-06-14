import { APIGatewayProxyResult } from 'aws-lambda';
import { formatResponse, mysql } from '../util/util';
import { IQueryObjectResult } from '../util/types/query';

export const handler = async function (): Promise<APIGatewayProxyResult> {
    try {
        const result = await getFacultyIdsAndNames();
        mysql.end();
        return formatResponse(200, result);
    } catch (error) {
        return formatResponse(400, { message: (error as Error).message });
    }
};

export const getFacultyIdsAndNames = async () => {
    const result = await mysql.query<FacultyQueryResultArray[]>(
        `SELECT JSON_OBJECTAGG(faculty_id, faculty_name) as faculty FROM faculty `
    );
    return result[0].faculty || {};
};


export interface FacultyQueryResultArray {
    faculty: IQueryObjectResult<string>;
}