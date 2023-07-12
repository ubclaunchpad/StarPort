import { getDatabase } from '../util/db';
import { LambdaBuilder } from '../util/middleware/middleware';
import { SuccessResponse } from '../util/middleware/response';
import { InputValidator } from '../util/middleware/inputValidator';
import { APIGatewayEvent } from 'aws-lambda';
import { Authorizer } from '../util/middleware/authorizer';
import { getStandings, refreshCache } from './standings';

const db = getDatabase();
export const handler = new LambdaBuilder(deleteStandingRequest)
    .use(new InputValidator())
    .use(new Authorizer())
    .build();

async function deleteStandingRequest(event: APIGatewayEvent) {
    const { id } = JSON.parse(event.body);
    await deleteStanding(id);
    await refreshCache(db);
    return new SuccessResponse(await getStandings(db));
}

export const deleteStanding = async (id: string) => {
    await db.deleteFrom('standing').where('id', '=', id).execute();
};
