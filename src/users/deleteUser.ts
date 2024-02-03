import { APIGatewayProxyEvent } from 'aws-lambda';
import { getDatabase } from '../util/db';
import { LambdaBuilder } from '../util/middleware/middleware';
import {
    APIResponse,
    BadRequestError,
    SuccessResponse,
} from '../util/middleware/response';
import { InputValidator } from '../util/middleware/inputValidator';
import { Authorizer } from '../util/middleware/authorizer';

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

    await deleteUser(event.pathParameters.id as string);
    return new SuccessResponse({
        message: `user with id : ${event.pathParameters.id} deleted`,
    });
}

export const deleteUser = async (userId: string): Promise<void> => {
    await db.deleteFrom('person').where('id', '=', Number(userId)).execute();
};
