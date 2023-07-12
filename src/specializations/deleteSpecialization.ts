import { getDatabase } from '../util/db';
import { LambdaBuilder } from '../util/middleware/middleware';
import { SuccessResponse } from '../util/middleware/response';
import { InputValidator } from '../util/middleware/inputValidator';
import { getSpecializations, refreshCache } from './specializations';
import { APIGatewayEvent } from 'aws-lambda';
import { Authorizer } from '../util/middleware/authorizer';

const db = getDatabase();
export const handler = new LambdaBuilder(deleteSpecializationRequest)
    .use(new InputValidator())
    .use(new Authorizer())
    .build();

async function deleteSpecializationRequest(event: APIGatewayEvent) {
    const { id } = JSON.parse(event.body);
    await deleteSpecialization(id);
    await refreshCache(db);
    return new SuccessResponse(await getSpecializations(db));
}

export const deleteSpecialization = async (id: string) => {
    await db.deleteFrom('specialization').where('id', '=', id).execute();
};
