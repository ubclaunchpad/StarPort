import { getDatabaseParser } from '../util/db';
import { LambdaBuilder } from '../util/middleware/middleware';
import { BadRequestError, SuccessResponse } from '../util/middleware/response';
import { InputValidator } from '../util/middleware/inputValidator';
import { APIGatewayEvent } from 'aws-lambda';
import { Authorizer } from '../util/middleware/authorizer';
import { ConnectionHandler } from '../util/middleware/connectionHandler';

const db = getDatabaseParser();
export const handler = new LambdaBuilder(deleteUserRoleRequest)
    .use(new InputValidator())
    .use(new Authorizer())
    .useAfter(new ConnectionHandler(db))
    .build();

async function deleteUserRoleRequest(event: APIGatewayEvent) {
    const { id, roleId } = JSON.parse(event.body);
    await deleteUserRole(id, roleId);
    return new SuccessResponse({ message: 'Role deleted successfully' });
}

export const deleteUserRole = async (userId: string, roleId: string) => {
    const verifyRole = await db
        .selectFrom('person_role')
        .select(['user_id', 'role_id'])
        .where('user_id', '=', userId)
        .where('role_id', '=', roleId)
        .executeTakeFirst();
    if (!verifyRole) {
        throw new BadRequestError(
            `role id: ${roleId} does not exist for user id: ${userId}`
        );
    }

    await db
        .deleteFrom('person_role')
        .where('user_id', '=', userId)
        .where('role_id', '=', roleId)
        .execute();
};
