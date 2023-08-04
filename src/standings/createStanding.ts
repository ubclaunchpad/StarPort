import { getDatabase, NewStanding } from '../util/db';
import { LambdaBuilder } from '../util/middleware/middleware';
import { SuccessResponse } from '../util/middleware/response';
import { InputValidator } from '../util/middleware/inputValidator';
import { APIGatewayEvent } from 'aws-lambda';
import { Authorizer } from '../util/middleware/authorizer';
import { getStandings, refreshCache } from './standings';

const db = getDatabase();
export const handler = new LambdaBuilder(createStandingRequest)
    .use(new InputValidator())
    .use(new Authorizer())
    .build();

async function createStandingRequest(event: APIGatewayEvent) {
    const { label } = JSON.parse(event.body);
    await createStanding({ label });
    await refreshCache(db);
    return new SuccessResponse(await getStandings(db));
}

export const createStanding = async (newStanding: NewStanding) => {
    const { id } = await db
        .insertInto('standing')
        .values(newStanding)
        .returning('id')
        .executeTakeFirst();
    return id;
};
