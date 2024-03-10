import { getDatabase } from '../util/db';
import { LambdaBuilder } from '../util/middleware/middleware';
import { SuccessResponse } from '../util/middleware/response';
import { InputValidator } from '../util/middleware/inputValidator';
import { APIGatewayEvent } from 'aws-lambda';
import { Authorizer } from '../util/middleware/authorizer';

const db = getDatabase();
export const handler = new LambdaBuilder(deleteStandingRequest)
    .use(new InputValidator())
    .use(new Authorizer())
    .build();

async function deleteStandingRequest(event: APIGatewayEvent) {
    const { id } = event.pathParameters;
    await deleteStanding(id);
    return new SuccessResponse({ message: `Standing ${id} deleted` });
}

export const deleteStanding = async (id: number) => {
    await db.deleteFrom('standing').where('id', '=', id).execute();
};
