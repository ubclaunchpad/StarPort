import {getDatabaseParser, NewStanding, queryDatabaseAPI} from '../util/db';
import { LambdaBuilder } from '../util/middleware/middleware';
import { SuccessResponse } from '../util/middleware/response';
import { InputValidator } from '../util/middleware/inputValidator';
import { APIGatewayEvent } from 'aws-lambda';
import { Authorizer } from '../util/middleware/authorizer';
import { getStandings } from './standings';

const db = getDatabaseParser();
export const handler = new LambdaBuilder(createStandingRequest)
    .use(new InputValidator())
    .use(new Authorizer())
    .build();

async function createStandingRequest(event: APIGatewayEvent) {
    const { label } = JSON.parse(event.body);
    await createStanding({ label });
    return new SuccessResponse(await getStandings(db));
}

export const createStanding = async (newStanding: NewStanding) => {
    const query = await db
        .insertInto('standing')
        .values(newStanding)
        .returning('id')
        .compile();

    const res = (await queryDatabaseAPI(query)).rows[0];
    return res;
};
