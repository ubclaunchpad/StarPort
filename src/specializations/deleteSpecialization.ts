import { getDatabase } from '../util/db';
import { LambdaBuilder } from '../util/middleware/middleware';
import { SuccessResponse } from '../util/middleware/response';
import { InputValidator } from '../util/middleware/inputValidator';
import { APIGatewayEvent } from 'aws-lambda';
import { Authorizer } from '../util/middleware/authorizer';

const db = getDatabase();
export const handler = new LambdaBuilder(deleteSpecializationRequest)
    .use(new InputValidator())
    .use(new Authorizer())
    .build();

async function deleteSpecializationRequest(event: APIGatewayEvent) {
    const { id } = event.pathParameters;
    await deleteSpecialization(id);
    return new SuccessResponse({ message: `Faculty ${id} deleted` });
}

export const deleteSpecialization = async (id: number) => {
    await db.deleteFrom('specialization').where('id', '=', id).execute();
};
