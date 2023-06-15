import { APIGatewayProxyResult } from 'aws-lambda';
import { formatResponse, mysql } from '../util/util';
import { IQueryObjectResult } from '../util/types/query';

export const handler = async function (): Promise<APIGatewayProxyResult> {
    try {
        const result = await getStandingIdsAndNames();
        mysql.end();
        return formatResponse(200, result);
    } catch (error) {
        return formatResponse(200, { message: (error as Error).message });
    }
};

export const getStandingIdsAndNames = async () => {
    const result = await mysql.query<StandingQueryResultArray[]>(
        `SELECT JSON_OBJECTAGG(standing_id, standing_name) as standing FROM standing`
    );
    return result[0].standing || {};
};

export interface StandingQueryResultArray {
    standing: IQueryObjectResult<string>;
}
