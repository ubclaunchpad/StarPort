import { getDatabase, NewTeam } from '../util/db';
import { LambdaBuilder } from '../util/middleware/middleware';
import { APIResponse, SuccessResponse } from '../util/middleware/response';
import { InputValidator } from '../util/middleware/inputValidator';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { Authorizer } from '../util/middleware/authorizer';

const db = getDatabase();

export const handler = new LambdaBuilder(router)
    .use(new InputValidator())
    // .use(new Authorizer())
    .build();

export async function router(
    event: APIGatewayProxyEvent
): Promise<APIResponse> {
    if (!event.body) throw new Error('No body provided');

    const body = JSON.parse(event.body) as NewTeam;
    const newTeamId = await createTeam(body);
    return new SuccessResponse({
        message: `team with id : ${newTeamId} created`,
    });
}
export const createTeam = async (newTeam: NewTeam) => {
    const param = newTeam;
    param.meta_data = JSON.stringify(newTeam.meta_data);
    console.log(param.meta_data);
    console.log(param);
    const { insertId } = await db
        .insertInto('team')
        .values(param)
        .executeTakeFirst();
    return insertId;
};
