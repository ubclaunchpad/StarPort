import { APIGatewayProxyResult } from 'aws-lambda';
import { formatResponse, mysql } from '../util/util';

let faculties;

export const handler = async function (): Promise<APIGatewayProxyResult> {
    try {
        if (!faculties) {
            faculties = await getFacultyIdsAndNames();
        }
        return formatResponse(200, faculties);
    } catch (error) {
        return formatResponse(400, { message: (error as Error).message });
    } finally {
        mysql.end();
    }
};

export const getFacultyIdsAndNames = async () => {
    const result = await mysql.query(`
        SELECT id, name FROM faculty
        `);
    return result || [];
};
