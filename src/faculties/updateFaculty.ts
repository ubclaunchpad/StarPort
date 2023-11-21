import { getDatabase, UpdateFaculty } from '../util/db';
import { LambdaBuilder } from '../util/middleware/middleware';
import { SuccessResponse } from '../util/middleware/response';
import { InputValidator } from '../util/middleware/inputValidator';
import { APIGatewayEvent } from 'aws-lambda';
import { Authorizer } from '../util/middleware/authorizer';

const db = getDatabase();
export const handler = new LambdaBuilder(updateFacultyRequest)
    .use(new InputValidator())
    .use(new Authorizer())
    .build();

async function updateFacultyRequest(event: APIGatewayEvent) {
    const { label } = JSON.parse(event.body);
    const { id } = event.pathParameters;
    await updateFaculty({ id, label });
    return new SuccessResponse({ message: `Faculty ${label} updated` });
}

export const updateFaculty = async (updateFaculty: UpdateFaculty) => {
    await db
        .updateTable('faculty')
        .set(updateFaculty)
        .where('id', '=', updateFaculty.id)
        .execute();
};
