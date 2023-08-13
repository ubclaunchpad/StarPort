import { getDatabaseParser, queryDatabaseAPI } from '../util/db';
import { LambdaBuilder, LambdaInput } from '../util/middleware/middleware';
import { SuccessResponse } from '../util/middleware/response';
import { InputValidator } from '../util/middleware/inputValidator';

const db = getDatabaseParser();
export const handler = new LambdaBuilder(getProjectsRequest)
    .use(new InputValidator())
    .build();

async function getProjectsRequest(event: LambdaInput) {
    const person_id: string | undefined =
        event.queryStringParameters?.person_id;
    return new SuccessResponse(await getProjects(person_id));
}

export const getProjects = async (personId?: string) => {
    let query;
    if (!personId) {
        query = db.selectFrom('project').selectAll().compile();
    } else {
        query = db
            .selectFrom('project')
            .innerJoin(
                'project_person',
                'project.title',
                'project_person.project_title'
            )
            .where('project_person.person_id', '=', personId)
            .selectAll()
            .compile();
    }
    return (await queryDatabaseAPI(query)).rows;
};
