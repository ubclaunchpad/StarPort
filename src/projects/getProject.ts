import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { formatResponse, mysql } from '../util/util';

export const handler = async function (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
    try {
        if (event === null) {
            throw new Error('event not found');
        }

        if (event.pathParameters === null || event.pathParameters.id === null) {
            throw new Error('Project Id is missing');
        }

        const resp = await getProject(Number(event.pathParameters.id));
        await mysql.end();

        return formatResponse(200, resp);
    } catch (error) {
        return formatResponse(200, { message: (error as any).message });
    }
};

export async function getProject(projectId: number): Promise<any> {
    const query = `SELECT
    p.id AS id,
    p.name,
    p.description,
    p.status_id AS statusId
    FROM project p
    WHERE ${projectId} = p.id`;

    const projects = (await mysql.query(query)) as any[];
    if (!projects) {
        throw new Error('project not found');
    }
    const project = projects[0];
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

    return project;
}
