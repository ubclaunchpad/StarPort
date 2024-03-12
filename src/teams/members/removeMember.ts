import { getDatabase } from '../../util/db';
import { LambdaBuilder } from '../../util/middleware/middleware';
import { APIResponse, SuccessResponse } from '../../util/middleware/response';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { Authorizer } from '../../util/middleware/authorizer';

const db = getDatabase();

export const handler = new LambdaBuilder(router)
    .use(new Authorizer(db))
    .build();

export async function router(
    event: APIGatewayProxyEvent
): Promise<APIResponse> {
    if (!event.body) throw new Error('No body provided');

    if (!event.pathParameters) throw new Error('No path parameters provided');
    if (!event.pathParameters.teamid || !event.pathParameters.userid)
        throw new Error('No teamid or userid provided');

    const { teamid, userid } = event.pathParameters;

    await removeMember(Number(teamid), Number(userid));
    return new SuccessResponse({
        message: `Successfully removed member from team ${teamid}`,
    });
}
export const removeMember = async (teamid: number, userid: number) => {
    await db
        .deleteFrom('team_member')
        .where('teamid', '=', teamid)
        .where('userid', '=', userid)
        .execute();
    return;
};
