import { APIGatewayProxyResult } from 'aws-lambda';
import { formatResponse, mysql } from '../util/util';
import { IQueryObjectResult } from '../util/types/query';

export const handler = async function (): Promise<APIGatewayProxyResult> {
    try {
        const result = await getProgramIdsAndNames();
        mysql.end();
        return formatResponse(200, result);
    } catch (error) {
        return formatResponse(200, { message: (error as Error).message });
    }
};

export const getProgramIdsAndNames = async () => {
    const result = await mysql.query<ProgramQueryResultArray[]>(
        `SELECT JSON_OBJECTAGG(program_id, program_name) as program FROM degree_program`
    );
    return result[0].program || {};
};

export interface ProgramQueryResultArray {
    program: IQueryObjectResult<string>;
}
