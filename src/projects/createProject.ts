import {getDatabaseParser, NewProject, queryDatabaseAPI} from '../util/db';
import { LambdaBuilder, LambdaInput } from '../util/middleware/middleware';
import { SuccessResponse } from '../util/middleware/response';
import { InputValidator } from '../util/middleware/inputValidator';
import { Authorizer } from '../util/middleware/authorizer';
import { ScopeController } from '../util/middleware/scopeHandler';

const db = getDatabaseParser();
export const handler = new LambdaBuilder(createProjectRequest)
    .use(new Authorizer())
    .use(new InputValidator())
    .use(new ScopeController())
    .build();

async function createProjectRequest(event: LambdaInput) {
    ScopeController.verifyScopes(event.userScopes, ['admin:write']);
    const projectData = JSON.parse(event.body) as NewProject;
    const title = await createProject(projectData);
    return new SuccessResponse({
        message: `Project ${title} created successfully`,
    });
}

export const createProject = async (newProject: NewProject) => {
    const query = await db
        .insertInto('project')
        .values(newProject)
        .returning('title')
        .compile();

    return (await queryDatabaseAPI(query)).rows[0];
};
