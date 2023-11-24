import { getDatabase, NewSpecialization } from '../util/db';
import { LambdaBuilder } from '../util/middleware/middleware';
import { SuccessResponse } from '../util/middleware/response';
import { InputValidator } from '../util/middleware/inputValidator';
import { APIGatewayEvent } from 'aws-lambda';
import { Authorizer } from '../util/middleware/authorizer';

const db = getDatabase();
export const handler = new LambdaBuilder(createSpecializationRequest)
    .use(new InputValidator())
    .use(new Authorizer())
    .build();

async function createSpecializationRequest(event: APIGatewayEvent) {
    const { label } = JSON.parse(event.body);
    const id = await createSpecialization({ label });
    return new SuccessResponse({ message: `Specialization ${label} created with id: ${id}` });
}

export const createSpecialization = async (newSpecialization: NewSpecialization) => {
    const { insertId } = await db
        .insertInto('specialization')
        .values(newSpecialization)
        .executeTakeFirst();
    return insertId;
};