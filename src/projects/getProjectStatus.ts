import { APIGatewayProxyResult } from 'aws-lambda';
import { formatResponse, mysql } from '../util/util';

export const handler = async function (): Promise<APIGatewayProxyResult> {
    try {
        const result = await getProjectStatusIdsAndNames();
        mysql.end();
        return formatResponse(200, result);
    } catch (error) {
        return formatResponse(400, { message: (error as Error).message });
    }
};

export const getProjectStatusIdsAndNames = async () => {
    const result =
        await mysql.query(`SELECT JSON_OBJECTAGG(ps.id, JSON_OBJECT('id', ps.id, 'status', ps.status)) AS projectStatus
    FROM project_status ps`);

    // parse the JSON object
    const socials = JSON.parse((result as any)[0].projectStatus);
    return (await socials) || {};
};
