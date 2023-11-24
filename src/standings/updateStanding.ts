import { getDatabase, UpdateStanding } from '../util/db';
import { LambdaBuilder } from '../util/middleware/middleware';
import { SuccessResponse } from '../util/middleware/response';
import { InputValidator } from '../util/middleware/inputValidator';
import { APIGatewayEvent } from 'aws-lambda';
import { Authorizer } from '../util/middleware/authorizer';

const db = getDatabase();
export const handler = new LambdaBuilder(updateStandingRequest)
    .use(new InputValidator())
    .use(new Authorizer())
    .build();

async function updateStandingRequest(event: APIGatewayEvent) {
    const { label } = JSON.parse(event.body);
    const { id } = event.pathParameters;
    await updateStanding({ id, label });
    return new SuccessResponse({ message: `Standing ${label} updated` });
}

export const updateStanding = async (updateStanding: UpdateStanding) => {
    await db
        .updateTable('standing')
        .set(updateStanding)
        .where('id', '=', updateStanding.id)
        .execute();
};