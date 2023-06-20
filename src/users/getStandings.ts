import { APIGatewayProxyResult } from 'aws-lambda';
import { formatResponse, mysql } from '../util/util';

let standings;

export const handler = async function (): Promise<APIGatewayProxyResult> {
    try {
        if (!standings) {
            standings = await getStandingIdsAndNames();
        }
        return formatResponse(200, standings);
    } catch (error) {
        return formatResponse(400, { message: (error as Error).message });
    } finally {
        mysql.end();
    }
};

export const getStandingIdsAndNames = async () => {
    const result = await mysql.query(`
        SELECT id, name FROM standing
        `);

    return result || [];
};
