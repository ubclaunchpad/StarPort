import { APIGatewayProxyEvent } from 'aws-lambda';
import { UpdatePerson, getDatabase } from '../util/db';
import { Authorizer } from '../util/middleware/authorizer';
import { InputValidator } from '../util/middleware/inputValidator';
import { LambdaBuilder } from '../util/middleware/middleware';
import { APIResponse, SuccessResponse } from '../util/middleware/response';

const db = getDatabase();

export const handler = new LambdaBuilder(updateRequest)
    .use(new InputValidator())
    .use(new Authorizer(db))
    .build();

export async function updateRequest(
    event: APIGatewayProxyEvent
): Promise<APIResponse> {
    if (!event.pathParameters) {
        throw new Error('Event parameters is missing');
    }

    if (!event.body) {
        throw new Error('Event body missing');
    }

    const updatePersonData = JSON.parse(event.body) as UpdatePerson;

    await updateUser(event.pathParameters.id as string, updatePersonData);
    return new SuccessResponse({
        message: `User with id : ${event.pathParameters.id} updated successfully`,
        updateUser: updatePersonData,
    });
}

export const updateUser = async (
    userId: string,
    updatePersonData: UpdatePerson
): Promise<void> => {
    const existingUser = await db
        .selectFrom('person')
        .select('id')
        .where('id', '=', Number(userId))
        .executeTakeFirst();

    if (!existingUser) {
        throw new Error(`User with id ${userId} not found`);
    }

    const updatedUser = {
        ...updatePersonData,
        account_updated: new Date(),
    };

    await db
        .updateTable('person')
        .set(updatedUser)
        .where('id', '=', Number(userId))
        .execute();
};
