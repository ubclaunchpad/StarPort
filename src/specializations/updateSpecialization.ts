import { getDatabase, UpdateSpecialization } from '../util/db';
import { LambdaBuilder } from '../util/middleware/middleware';
import { SuccessResponse } from '../util/middleware/response';
import { InputValidator } from '../util/middleware/inputValidator';
import { getSpecializations, refreshCache } from './specializations';
import { APIGatewayEvent } from 'aws-lambda';
import { Authorizer } from '../util/middleware/authorizer';

const db = getDatabase();
export const handler = new LambdaBuilder(updateSpecializationRequest)
    .use(new InputValidator())
    .use(new Authorizer())
    .build();

async function updateSpecializationRequest(event: APIGatewayEvent) {
    const { id, label } = JSON.parse(event.body);
    await updateSpecialization({ id, label });
    await refreshCache(db);
    return new SuccessResponse(await getSpecializations(db));
}

export const updateSpecialization = async (
    updateSpecialization: UpdateSpecialization
) => {
    await db
        .updateTable('specialization')
        .set(updateSpecialization)
        .where('id', '=', updateSpecialization.id)
        .execute();
};
