import { APIGatewayProxyEvent } from 'aws-lambda';
import { getDatabase } from '../util/db';
import { LambdaBuilder } from '../util/middleware/middleware';
import { Authorizer } from '../util/middleware/authorizer';
import { InputValidator } from '../util/middleware/inputValidator';
import { NotFoundError, SuccessResponse } from '../util/middleware/response';

const db = getDatabase();
export const handler = new LambdaBuilder(router)
    .use(new InputValidator())
    .use(new Authorizer())
    .build();

export async function router(event: APIGatewayProxyEvent): Promise<any> {
    const userEmail = (event as unknown as { googleAccount: { email: string } })
        .googleAccount.email;
    const user = await getUser(userEmail);
    return new SuccessResponse(user);
}

export async function getUser(userEmail: string) {
    const user = await db
        .selectFrom('person')
        .select(['id', 'email'])
        .where('email', '=', userEmail)
        .executeTakeFirst();

    if (!user) {
        throw new NotFoundError(`User with email ${userEmail} not found`);
    }
    return user;
}
