import { getDatabase } from '../util/db';
import { LambdaBuilder } from '../util/middleware/middleware';
import { APIResponse, SuccessResponse } from '../util/middleware/response';
import { InputValidator } from '../util/middleware/inputValidator';

const db = getDatabase();

export const handler = new LambdaBuilder(router)
    .use(new InputValidator())
    .build();

export async function router(): Promise<APIResponse> {
    const teams = await getTeams();
    return new SuccessResponse(teams);
}
export const getTeams = async () => {
    const teams = await db.selectFrom('team').selectAll().execute();
    const teamTerms = await db.selectFrom('team_term').selectAll().execute();
    const teamsWithTerms: any[]= []
    for (const team of teams) {
        const t = team as any;
        t.team_terms = teamTerms.filter(term => term.teamid === team.id).map(term => term.term_year);
        teamsWithTerms.push(t);
    }

    return teamsWithTerms;
};
