import { getDatabase, NewTeam } from '../util/db';
import { LambdaBuilder } from '../util/middleware/middleware';
import { APIResponse, SuccessResponse } from '../util/middleware/response';
import { InputValidator } from '../util/middleware/inputValidator';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { Authorizer } from '../util/middleware/authorizer';

const db = getDatabase();

export const handler = new LambdaBuilder(router)
    .use(new InputValidator())
    .use(new Authorizer(db))
    .build();

export async function router(
    event: APIGatewayProxyEvent
): Promise<APIResponse> {
    if (!event.body) throw new Error('No body provided');

    const body = JSON.parse(event.body) as NewTeam & { term_year: number };
    const newTeamId = await createTeam(body);
    return new SuccessResponse({
        message: `team with id : ${newTeamId} created`,
    });
}
export const createTeam = async (newTeam: NewTeam & { term_year: number }) => {
    const { term_year, ...team } = newTeam;
    team.meta_data = JSON.stringify(team.meta_data);
    const { insertId } = await db
        .insertInto('team')
        .values(team)
        .executeTakeFirst();
    return insertId;
};
