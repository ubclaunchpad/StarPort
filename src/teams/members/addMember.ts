import { getDatabase, NewTeamMember } from '../../util/db';
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

    const { team_role } = JSON.parse(event.body);
    const { teamid, userid } = event.pathParameters;

    await addMember({
        teamid: Number(teamid),
        userid: Number(userid),
        team_role,
    });
    return new SuccessResponse({
        message: `Successfully added member to team ${teamid}`,
    });
}
export const addMember = async (newMember: NewTeamMember) => {
    const { insertId } = await db
        .insertInto('team_member')
        .values(newMember)
        .executeTakeFirst();

    if (!insertId) throw new Error('Failed to add member');
    return insertId;
};
