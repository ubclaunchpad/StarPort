import { APIGatewayProxyResult } from 'aws-lambda';
import { formatResponse,mysql } from '../util/util';

export const handler = async function (): Promise<APIGatewayProxyResult> {
    try {
        const result = await getProgramIdsAndNames();
        mysql.end();
        return formatResponse(200, result);
    } catch (error) {
        return formatResponse(200, { message: (error as any).message });
    }
};

export const getProgramIdsAndNames = async () => {
    const result = await mysql.query(
        `SELECT JSON_OBJECTAGG(program_id, program_name) FROM degree_program`
    );
    return (await result) || {};
};
