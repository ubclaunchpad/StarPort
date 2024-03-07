import { getDatabase } from '../util/db';
import { LambdaBuilder } from '../util/middleware/middleware';
import { APIResponse, NotFoundError, SuccessResponse } from '../util/middleware/response';
import { InputValidator } from '../util/middleware/inputValidator';
import { APIGatewayProxyEvent } from 'aws-lambda';

const db = getDatabase();

export const handler = new LambdaBuilder(router)
    .use(new InputValidator())
    // .use(new Authorizer())
    .build();

export async function router(
    event: APIGatewayProxyEvent
): Promise<APIResponse> {
    if (!event.pathParameters) throw new Error('No id provided');
    const id = event.pathParameters.id as unknown as number;
    const team = await getTeam(id);
    if (!team) throw new NotFoundError('Team not found');
    return new SuccessResponse(team);
}
export const getTeam = async (teamid: number) => {
    const team = await db
        .selectFrom('team')
        .where('id', '=', teamid)
        .selectAll()
        .executeTakeFirst();
    return team;
};
