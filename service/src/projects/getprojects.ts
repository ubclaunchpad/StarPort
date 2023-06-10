import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { formatResponse, mysql } from './util';
import { ProjectQueryI } from './project';

export const handler = async function (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
    try {
        const params = (event && event.queryStringParameters) || {};

        let projectQuery: ProjectQueryI = params;
        if (params.userIds) {
            projectQuery.userIds = params.userIds
                .split(',')
                .map((id: string) => parseInt(id));
        }
        const resp = await getAll(projectQuery as ProjectQueryI);
        mysql.end();
        return formatResponse(200, resp);
    } catch (error) {
        return formatResponse(200, { message: (error as any).message });
    }
};

export async function getAll(projectQuery: ProjectQueryI) {
    let query = `SELECT
    p.id AS id,
    p.name,
    p.description,
    p.status_id AS statusId
    FROM project p
    WHERE 1=1 `;

    if (projectQuery.name) {
        query += ` AND p.name LIKE '%${projectQuery.name}%'`;
    }

    if (projectQuery.pid) {
        query += ` AND p.id = ${projectQuery.pid}`;
    }

    if (projectQuery.sid) {
        query += ` AND p.status_id = ${projectQuery.sid}`;
    }

    if (projectQuery.userIds) {
        query += ` AND p.id IN (SELECT project_id FROM project_person WHERE user_id IN (${projectQuery.userIds.join(
            ','
        )}))`;
    }

    console.log(query);

    if (projectQuery.limit && projectQuery.offset) {
        query += ` LIMIT ${projectQuery.limit} OFFSET ${projectQuery.offset}`;
    } else {
        query += ` LIMIT 20 OFFSET 0`;
    }

    const projects = (await mysql.query(query)) as any[];
    if (!projects) {
        throw new Error('project(s) not found');
    }

    if (projects.length === 0) {
        return [];
    }

    for (let i = 0; i < projects.length; i++) {
        const project = projects[i];
        const projectUserQuery = `SELECT
        p.user_id AS userId,
        p.email,
        p.first_name AS firstName,
        p.pref_name AS prefName,
        p.last_name AS lastName,
        p.standing_id AS standing,
        p.faculty_id AS faculty,
        proj_person.role_id AS roleId
        FROM person p
        INNER JOIN project_person proj_person ON proj_person.user_id = p.user_id AND proj_person.project_id = ${project.id}`;

        const projectUsers = await mysql.query(projectUserQuery);
        project.users = projectUsers || [];

        const projectResourceQuery = await mysql.query(`SELECT
        r.id AS id,
        r.name,
        r.description,
        r.link,
        r.type_id AS typeId
        FROM resource r
        INNER JOIN project_resource proj_resource ON proj_resource.resource_id = r.id AND proj_resource.project_id = ${project.id}`);
        project.resources = projectResourceQuery || [];
    }
    return projects;
}
