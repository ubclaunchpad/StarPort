import { getDatabase } from '../../util/db';
import { LambdaBuilder } from '../../util/middleware/middleware';
import { APIResponse, SuccessResponse } from '../../util/middleware/response';
import { APIGatewayProxyEvent } from 'aws-lambda';

const db = getDatabase();

export const handler = new LambdaBuilder(router).build();

export async function router(
    event: APIGatewayProxyEvent
): Promise<APIResponse> {
    if (!event.pathParameters) throw new Error('No path parameters provided');
    if (!event.pathParameters.teamid) throw new Error('No teamid provided');

    const teamid = Number(event.pathParameters.teamid);
    const members = await getMembers(teamid);
    return new SuccessResponse(members);
}
export const getMembers = async (teamid: number) => {
    const members = await db
        .selectFrom('team_member')
        .where('teamid', '=', teamid)
        .innerJoin('person', 'team_member.userid', 'person.id')
        .select([
            'person.email',
            'team_member.team_role',
            'userid',
            'person.first_name',
            'person.last_name',
            'person.pref_name',
        ])
        .execute();

    return members;
};
