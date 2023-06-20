import { APIGatewayProxyResult } from 'aws-lambda';
import { formatResponse, mysql } from '../util/util';

let roles;

export const handler = async function (): Promise<APIGatewayProxyResult> {
    try {
        if (!roles) {
            roles = await getRoleIdsAndNames();
        }
        return formatResponse(200, roles);
    } catch (error) {
        return formatResponse(400, { message: (error as Error).message });
    } finally {
        mysql.end();
    }
};

export const getRoleIdsAndNames = async () => {
    const result = await mysql.query(`
        SELECT id, name FROM role
        `);

    return result || [];
};
