import { getDatabase, NewFaculty } from '../util/db';
import { LambdaBuilder } from '../util/middleware/middleware';
import { SuccessResponse } from '../util/middleware/response';
import { InputValidator } from '../util/middleware/inputValidator';
import { APIGatewayEvent } from 'aws-lambda';
import { Authorizer } from '../util/middleware/authorizer';

const db = getDatabase();
export const handler = new LambdaBuilder(createFacultyRequest)
    .use(new InputValidator())
    .use(new Authorizer())
    .build();

async function createFacultyRequest(event: APIGatewayEvent) {
    const { label } = JSON.parse(event.body);
    const id = await createFaculty({ label });
    return new SuccessResponse({ message: `Faculty ${label} created with id: ${id}` });
}

export const createFaculty = async (newFaculty: NewFaculty) => {
    const { insertId } = await db
        .insertInto('faculty')
        .values(newFaculty)
        .executeTakeFirst();
    return insertId;
};
