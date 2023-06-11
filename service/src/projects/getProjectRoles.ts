import { APIGatewayProxyResult } from 'aws-lambda';
import { formatResponse, mysql } from './util';

export const handler = async function (): Promise<APIGatewayProxyResult> {
    try {
        const result = await getProjectRoleIdsAndNames();
        mysql.end();
        return formatResponse(200, result);
    } catch (error) {
        return formatResponse(400, { message: (error as any).message });
    }
};

export const getProjectRoleIdsAndNames = async () => {
    const result =
        await mysql.query(`SELECT JSON_OBJECTAGG(pr.role_id, JSON_OBJECT('id', pr.role_id, 'name', pr.role_name)) AS projectRoles
    FROM project_role pr`);

    // parse the JSON object
    const socials = JSON.parse((result as any)[0].projectRoles);
    return (await socials) || {};
};
