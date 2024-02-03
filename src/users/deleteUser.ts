import { APIGatewayProxyEvent } from 'aws-lambda';
import { getDatabase } from '../util/db';
import { InputValidator } from '../util/middleware/inputValidator';
import { LambdaBuilder } from '../util/middleware/middleware';
import {
    APIResponse,
    BadRequestError,
    SuccessResponse,
} from '../util/middleware/response';

const db = getDatabase();

export const handler = new LambdaBuilder(router)
    .use(new InputValidator())
    // .use(new Authorizer())
    .build();

export async function router(
    event: APIGatewayProxyEvent
): Promise<APIResponse> {
    if (!event.pathParameters) {
        throw new BadRequestError('Event path parameters missing');
    }

    const userID = event.pathParameters.id;

    const existingUser = await db
        .selectFrom('person')
        .select('id')
        .where('id', '=', Number(userID))
        .executeTakeFirst();

    if (!existingUser) {
        throw new BadRequestError(`User with id ${userID} not found`);
    }

    await deleteUser(userID as string);
    return new SuccessResponse({
        message: `user with id : ${userID} deleted`,
    });
}

export const deleteUser = async (userId: string): Promise<void> => {
    await db.deleteFrom('person').where('id', '=', Number(userId)).execute();
};
