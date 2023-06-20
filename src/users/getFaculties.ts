import { APIGatewayProxyResult } from 'aws-lambda';
import { formatResponse, mysql } from '../util/util';

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
    const result = await mysql.query(`
        SELECT id, name FROM faculty
        `);
    return result || [];
};
