import { getDatabaseParser } from '../util/db';
import { LambdaBuilder } from '../util/middleware/middleware';
import { SuccessResponse } from '../util/middleware/response';
import { InputValidator } from '../util/middleware/inputValidator';
import { standings, refreshCache } from './standings';

const db = getDatabaseParser();
export const handler = new LambdaBuilder(getStandingRequest)
    .use(new InputValidator())
    .build();

async function getStandingRequest() {
    return new SuccessResponse(await getStandings());
}

export async function getStandings() {
    if (!standings) {
        await refreshCache(db);
    }
    return standings;
}
