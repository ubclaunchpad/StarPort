import { APIGatewayProxyResult } from 'aws-lambda';
import { formatResponse, mysql } from '../util/util';

let specializations;

export const handler = async function (): Promise<APIGatewayProxyResult> {
    try {
        if (!specializations) {
            specializations = await getSpecializationIdsAndNames();
        }
        return formatResponse(200, specializations);
    } catch (error) {
        return formatResponse(400, { message: (error as Error).message });
    } finally {
        mysql.end();
    }
};

export const getSpecializationIdsAndNames = async () => {
    const result = await mysql.query(`
        SELECT id, name FROM specialization
        `);
    return result || [];
};
