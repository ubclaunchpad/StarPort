import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { formatResponse, mysql } from './util';
import { ProjectI } from './project';

export const handler = async function (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
    try {
        if (event === null) {
            throw new Error('event not found');
        }

        if (event.body === null) {
            throw new Error('Request body is missing');
        }
        const createProjectId = await createProject(
            JSON.parse(event.body) as unknown as ProjectI
        );
        mysql.end();
        return formatResponse(
            200,
            `Project with id : ${createProjectId} created`
        );
    } catch (error) {
        return formatResponse(200, { message: (error as any).message });
    }
};

export const createProject = async (
    projectSetup: ProjectI
): Promise<string> => {
    const { name, description, status_id } = projectSetup;
    const result = (await mysql.query(
        `INSERT INTO project (name, description, status_id) VALUES (?, ?, ?)`,
        [name, description, status_id]
    )) as any;
    if (!result || !result.insertId) {
        throw new Error('Project creation failed');
    }
    return result.insertId;
};
