import { APIGatewayProxyEvent } from 'aws-lambda';
import { getDatabaseParser, queryDatabaseAPI } from '../util/db';
import { LambdaBuilder } from '../util/middleware/middleware';
import { Authorizer } from '../util/middleware/authorizer';
import { InputValidator } from '../util/middleware/inputValidator';
import {
    APIResponse,
    NotFoundError,
    SuccessResponse,
} from '../util/middleware/response';

const db = getDatabaseParser();
export const handler = new LambdaBuilder(router)
    .use(new InputValidator())
    .use(new Authorizer())
    .build();

export async function router(
    event: APIGatewayProxyEvent
): Promise<APIResponse> {
    const userEmail = (event as unknown as { googleAccount: { email: string } })
        .googleAccount.email;
    const user = await getUser(userEmail);
    return new SuccessResponse(user);
}

export async function getUser(userEmail: string) {
    const query = await db
        .selectFrom('person')
        .select(['id', 'email'])
        .where('email', '=', userEmail)
        .compile();

    const res = (await queryDatabaseAPI(query)).rows;

    const user = res[0];

    if (!user) {
        throw new NotFoundError(`User with email ${userEmail} not found`);
    }
    return user;
}
