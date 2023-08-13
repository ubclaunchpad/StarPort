import {getDatabaseParser, NewProject, queryDatabaseAPI} from '../util/db';
import { LambdaBuilder, LambdaInput } from '../util/middleware/middleware';
import { SuccessResponse } from '../util/middleware/response';
import { InputValidator } from '../util/middleware/inputValidator';
import { Authorizer } from '../util/middleware/authorizer';
import { ScopeController } from '../util/middleware/scopeHandler';

const db = getDatabaseParser();
export const handler = new LambdaBuilder(deleteProjectRequest)
    .use(new Authorizer())
    .use(new InputValidator())
    .use(new ScopeController())
    .build();

async function deleteProjectRequest(event: LambdaInput) {
    ScopeController.verifyScopes(event.scopes, ['admin:write']);
    const projectTitle = event.pathParameters?.title;
    const title = await deleteProject(projectTitle);
    return new SuccessResponse({
        message: `Project ${title} deleted successfully`,
    });
}

export const deleteProject = async (newProject: NewProject) => {
    const query = db
        .deleteFrom('project')
        .where('title', '=', newProject.title)
        .compile();

    return (await queryDatabaseAPI(query)).rows[0];
};
