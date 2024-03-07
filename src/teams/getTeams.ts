import { getDatabase } from '../util/db';
import { LambdaBuilder } from '../util/middleware/middleware';
import { APIResponse, SuccessResponse } from '../util/middleware/response';
import { InputValidator } from '../util/middleware/inputValidator';

const db = getDatabase();

export const handler = new LambdaBuilder(router)
    .use(new InputValidator())
    // .use(new Authorizer())
    .build();

export async function router(): Promise<APIResponse> {
    const teams = await getTeams();
    return new SuccessResponse(teams);
}
export const getTeams = async () => {
    const teams = await db
        .selectFrom('team')
        .selectAll()
        .execute();
    return teams;
};
