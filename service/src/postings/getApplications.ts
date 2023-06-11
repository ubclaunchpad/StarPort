import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { formatResponse, mysql } from '../util/util';
import { ApplicationsQueryI } from './project';

export const handler = async function (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
    try {
        const params = (event && event.pathParameters) || {};
        if (!params.id) {
            return formatResponse(400, { message: 'Missing pid' });
        }

        const applicationsQuery: ApplicationsQueryI = {
            pid: parseInt(params.id),
        };

        const resp = await getAll(applicationsQuery);
        mysql.end();
        return formatResponse(200, resp);
    } catch (error) {
        return formatResponse(200, { message: (error as any).message });
    }
};

export async function getAll(applicationsQuery: ApplicationsQueryI) {
    let query = `SELECT
    app.email as email,
    app.first_name as firstName,
    app.last_name as lastName,
    app.pref_name as prefName,
    app.last_name as lastName,
    app.faculty_id as faculty,
    app.program_id as program,
    app.standing_id as standing,
    app.resume_link as resumeLink,
    app.gender_id,
    app.ethnicity_id,
    app.pronoun_id,
    app.application_status_id as applicationStatus,
    p.user_id as userId
    FROM
      application app
    LEFT JOIN
      person p ON app.email = p.email
    WHERE
     app.posting_id = ${applicationsQuery.pid}
 `;

    if (applicationsQuery.isMember && applicationsQuery.isMember === true) {
        query += ` AND p.user_id IS NOT NULL`;
    }

    const userApplications = (await mysql.query(query)) as any[];
    if (!userApplications) {
        throw new Error('posting(s) not found');
    }

    if (userApplications.length === 0) {
        return {};
    }

    const query2 = `SELECT
    application_status.id as id,
    application_status.status as status
    FROM
    application_status;`;

    const appStatus = (await mysql.query(query2)) as any[];

    const applications: any = {};

    for (const status of appStatus) {
        applications[status.id as unknown as any] = [];
    }

    for (const userApplication of userApplications) {
        if (userApplication.applicationStatus) {
            applications[userApplication.applicationStatus].push(
                userApplication
            );
        }
    }

    return applications;
}
