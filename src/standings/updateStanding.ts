import { getDatabaseParser, UpdateStanding } from '../util/db';
import { LambdaBuilder } from '../util/middleware/middleware';
import { SuccessResponse } from '../util/middleware/response';
import { InputValidator } from '../util/middleware/inputValidator';
import { getStandings, refreshCache } from './standings';
import { APIGatewayEvent } from 'aws-lambda';
import { Authorizer } from '../util/middleware/authorizer';

const db = getDatabaseParser();
export const handler = new LambdaBuilder(updateStandingRequest)
    .use(new InputValidator())
    .use(new Authorizer())
    .build();

async function updateStandingRequest(event: APIGatewayEvent) {
    const { id, label } = JSON.parse(event.body);
    await updateStanding({ id, label });
    await refreshCache(db);
    return new SuccessResponse(await getStandings(db));
}

export const updateStanding = async (updateStanding: UpdateStanding) => {
    await db
        .updateTable('standing')
        .set(updateStanding)
        .where('id', '=', updateStanding.id)
        .execute();
};
