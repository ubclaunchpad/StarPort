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
export const getTeams = async (query: any = {}) => {
    const q = db.selectFrom('team').selectAll();
    if (query.userid) {
        q.innerJoin('team_member', 'team.id', 'team_member.teamid').where(
            'team_member.userid',
            '=',
            query.userid
        );
    }
    const teams = await q.execute();
    const teamTerms = await db.selectFrom('team_term').selectAll().execute();
    const teamsWithTerms: any[] = [];
    for (const team of teams) {
        const t = team as any;
        t.team_terms = teamTerms
            .filter((term) => term.teamid === team.id)
            .map((term) => term.term_year);
        teamsWithTerms.push(t);
    }

    return teamsWithTerms;
};
