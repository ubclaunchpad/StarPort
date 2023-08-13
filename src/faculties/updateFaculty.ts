import { getDatabaseParser, UpdateFaculty } from '../util/db';
import { LambdaBuilder } from '../util/middleware/middleware';
import { SuccessResponse } from '../util/middleware/response';
import { InputValidator } from '../util/middleware/inputValidator';
import { getFaculties, refreshCache } from './faculties';
import { APIGatewayEvent } from 'aws-lambda';
import { Authorizer } from '../util/middleware/authorizer';
import { ConnectionHandler } from '../util/middleware/connectionHandler';

const db = getDatabaseParser();
export const handler = new LambdaBuilder(updateFacultyRequest)
    .use(new InputValidator())
    .use(new Authorizer())
    .useAfter(new ConnectionHandler(db))
    .build();

async function updateFacultyRequest(event: APIGatewayEvent) {
    const { id, label } = JSON.parse(event.body);
    await updateFaculty({ id, label });
    await refreshCache(db);
    return new SuccessResponse(await getFaculties(db));
}

export const updateFaculty = async (updateFaculty: UpdateFaculty) => {
    await db
        .updateTable('faculty')
        .set(updateFaculty)
        .where('id', '=', updateFaculty.id)
        .execute();
};
