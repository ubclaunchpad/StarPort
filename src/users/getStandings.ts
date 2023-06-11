import { APIGatewayProxyResult } from 'aws-lambda';
import { formatResponse, mysql } from '../util/util';

export const handler = async function (): Promise<APIGatewayProxyResult> {
    try {
        const result = await getStandingIdsAndNames();
        mysql.end();
        return formatResponse(200, result);
    } catch (error) {
        return formatResponse(200, { message: (error as any).message });
    }
};

export const getStandingIdsAndNames = async () => {
    const result = await mysql.query(
        `SELECT JSON_OBJECTAGG(standing_id, standing_name) FROM standing`
    );
    return (await result) || {};
};