import { APIGatewayProxyResult } from 'aws-lambda';
import { formatResponse, mysql } from '../util/util';

export const handler = async function (): Promise<APIGatewayProxyResult> {
    try {
        const result = await getSpecializationIdsAndNames();
        mysql.end();
        return formatResponse(200, result);
    } catch (error) {
        return formatResponse(400, { message: (error as Error).message });
    }
};

export const getSpecializationIdsAndNames = async () => {
    const result = await mysql.query(`
        SELECT id, name FROM specialization
        `);
    return result || [];
};
