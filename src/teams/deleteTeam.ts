import { getDatabase } from '../util/db';
import { LambdaBuilder } from '../util/middleware/middleware';
import { APIResponse, SuccessResponse } from '../util/middleware/response';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { Authorizer } from '../util/middleware/authorizer';

const db = getDatabase();

export const handler = new LambdaBuilder(router)
    .use(new Authorizer(db))
    .build();

export async function router(
    event: APIGatewayProxyEvent
): Promise<APIResponse> {
    if (!event.body) throw new Error('No body provided');

    if (!event.pathParameters) throw new Error('No path parameters provided');
    if (!event.pathParameters.teamid) throw new Error('No teamid provided');

    const { teamid } = event.pathParameters;

    await deleteTeam(Number(teamid));
    return new SuccessResponse({
        message: `Successfully deleted team - ${teamid}`,
    });
}
export const deleteTeam = async (teamid: number) => {
    const promises: Promise<any>[] = [];
    promises.push(
        db.deleteFrom('team_member').where('teamid', '=', teamid).execute()
    );
    promises.push(db.deleteFrom('team').where('id', '=', teamid).execute());
    await Promise.all(promises);
};
