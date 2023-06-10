import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { formatResponse, mysql } from './util';

export const handler = async function (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
    try {
        const result = await getApplicationStatusIdsAndNames();
        mysql.end();
        return formatResponse(200, result);
    } catch (error) {
        return formatResponse(400, { message: (error as any).message });
    }
};

export const getApplicationStatusIdsAndNames = async () => {
    const result =
        await mysql.query(`SELECT JSON_OBJECTAGG(app.id, JSON_OBJECT('id', app.id, 'status', app.status)) AS applicationStatus
    FROM application_status app`);

    // parse the JSON object
    const applicationStatus = JSON.parse((result as any)[0].applicationStatus);
    return (await applicationStatus) || {};
};
