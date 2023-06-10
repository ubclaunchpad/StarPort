import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { formatResponse, mysql } from './util';
import { ApplicationsQueryI, PostingQueryI } from './project';

export const handler = async function (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
    try {
        const params = (event && event.queryStringParameters) || {};
        const applicationsQuery: ApplicationsQueryI =
            params as ApplicationsQueryI;

        const resp = await getAll(applicationsQuery);
        mysql.end();
        return formatResponse(200, resp);
    } catch (error) {
        return formatResponse(200, { message: (error as any).message });
    }
};

export async function getAll(applicationsQuery: ApplicationsQueryI) {
    let query = `
    SELECT
    app.application_status_id as applicationStatus,
    p.user_id as userId,
    proj.name AS projectName,
    proj.id AS projectId,
    post.id AS id,
    post.title,
    post.project_role_id AS roleId,
    post.project_id AS projectId
    FROM
      application app
    LEFT JOIN person p ON app.email = p.email
    LEFT JOIN posting post ON app.posting_id = post.id
    LEFT JOIN project proj ON post.project_id = proj.id
    WHERE
      1 = 1`;

    if (applicationsQuery.applicantEmail) {
        query += ` AND app.email = '${applicationsQuery.applicantEmail}'`;
    }

    const userApplications = (await mysql.query(query)) as any[];
    if (!userApplications) {
        throw new Error('no app(s) not found');
    }

    if (userApplications.length === 0) {
        return [];
    }

    return userApplications;
}
