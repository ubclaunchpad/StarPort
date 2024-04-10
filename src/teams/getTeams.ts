import { getDatabase } from '../util/db';
import { LambdaBuilder } from '../util/middleware/middleware';
import { APIResponse, SuccessResponse } from '../util/middleware/response';
import { InputValidator } from '../util/middleware/inputValidator';
import { APIGatewayProxyEvent } from 'aws-lambda';

const db = getDatabase();

export const handler = new LambdaBuilder(router)
    .use(new InputValidator())
    .build();

export async function router(
    event: APIGatewayProxyEvent
): Promise<APIResponse> {
    const query = event.queryStringParameters || {};
    const teams = await getTeams(query);
    return new SuccessResponse(teams);
}
export const getTeams = async (filter: any) => {
    return await db.selectFrom('team')
    .select(['team.id','team.label','team.description','team.created_at','team.updated_at','team.image_link','team.meta_data','team.year', 'team.type'])
    .$if(filter.userid !== undefined, (query) =>
        query.innerJoin('team_member', 'team.id', 'team_member.teamid')
        .where('team_member.userid','=',filter.userid)
    )
    .orderBy('team.year desc')
    .execute();
};
