import { APIGatewayProxyResult } from 'aws-lambda';
import { formatResponse, mysql } from './util';

export const handler = async function (): Promise<APIGatewayProxyResult> {
    try {
        const result = await getResourceTypes();
        mysql.end();
        return formatResponse(200, result);
    } catch (error) {
        return formatResponse(400, { message: (error as any).message });
    }
};

export const getResourceTypes = async () => {
    const result =
        await mysql.query(`SELECT JSON_OBJECTAGG(rt.type, JSON_OBJECT('type', rt.type)) AS resourceTypes
    FROM resource_type rt`);
    // parse the JSON object
    const socials = JSON.parse((result as any)[0].resourceTypes);
    return (await socials) || {};
};
