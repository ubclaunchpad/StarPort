import { APIGatewayProxyEvent } from 'aws-lambda';
import { LambdaBuilder } from '../util/middleware/middleware';
import { InputValidator } from '../util/middleware/inputValidator';
import { Authorizer } from '../util/middleware/authorizer';
import { APIResponse, SuccessResponse } from '../util/middleware/response';
import { getDatabase, UpdatePerson } from '../util/db';

const db = getDatabase();

export const handler = new LambdaBuilder(updateRequest)
    .use(new InputValidator())
    .use(new Authorizer())
    .build();

export async function updateRequest(
    event: APIGatewayProxyEvent
): Promise<APIResponse> {
    await updateUser(
        event.pathParameters.id as string,
        JSON.parse(event.body) as UpdatePerson
    );
    return new SuccessResponse({
        message: `user with id : ${event.pathParameters.id} updated`,
    });
}

export const updateUser = async (
    userId: string,
    UpdatePerson: UpdatePerson
): Promise<void> => {
    const updatedUser = {
        ...UpdatePerson,
        updated_at: new Date().toISOString(),
    };
    await db
        .updateTable('person')
        .set({
            ...updatedUser,
        })
        .where('id', '=', userId)
        .execute();
};
