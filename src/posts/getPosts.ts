import { getDatabase } from '../util/db';
import { LambdaBuilder } from '../util/middleware/middleware';
import { APIResponse, SuccessResponse } from '../util/middleware/response';
import { InputValidator } from '../util/middleware/inputValidator';
import { APIGatewayEvent } from 'aws-lambda';

const db = getDatabase();

export const handler = new LambdaBuilder(router)
    .use(new InputValidator())
    // .use(new Authorizer())
    .build();

export async function router(
    event: APIGatewayEvent

): Promise<APIResponse> {
    const q = event.queryStringParameters;
    if (q && q.teamid) {
        const team = await getPosts(Number(q.teamid));
        return new SuccessResponse(team);
    } else {
        const teams = await getPosts();
        return new SuccessResponse(teams);
    }
}
export const getPosts = async (teamid?: number) => {
    const post = await db
        .selectFrom('post')
        .selectAll()
        .$if(teamid !== undefined, (query) => query.where('teamid', '=', teamid as number))
        .orderBy('updated_at desc')
        .execute();
    return post;
};
