import { getDatabaseParser, NewSpecialization } from '../util/db';
import { LambdaBuilder } from '../util/middleware/middleware';
import { SuccessResponse } from '../util/middleware/response';
import { InputValidator } from '../util/middleware/inputValidator';
import { getSpecializations, refreshCache } from './specializations';
import { APIGatewayEvent } from 'aws-lambda';
import { Authorizer } from '../util/middleware/authorizer';

const db = getDatabaseParser();
export const handler = new LambdaBuilder(createSpecializationRequest)
    .use(new InputValidator())
    .use(new Authorizer())
    .build();

async function createSpecializationRequest(event: APIGatewayEvent) {
    const { label } = JSON.parse(event.body);
    await createSpecialization({ label });
    await refreshCache(db);
    return new SuccessResponse(await getSpecializations(db));
}

export const createSpecialization = async (
    newSpecialization: NewSpecialization
) => {
    const { id } = await db
        .insertInto('specialization')
        .values(newSpecialization)
        .returning('id')
        .executeTakeFirst();
    return id;
};
