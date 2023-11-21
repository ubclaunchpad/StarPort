import { getDatabase } from '../util/db';
import { LambdaBuilder } from '../util/middleware/middleware';
import { BadRequestError, SuccessResponse } from '../util/middleware/response';
import { InputValidator } from '../util/middleware/inputValidator';
import { APIGatewayEvent } from 'aws-lambda';
import { Authorizer } from '../util/middleware/authorizer';

const db = getDatabase();
export const handler = new LambdaBuilder(addUserRoleRequest)
    .use(new InputValidator())
    .use(new Authorizer())
    .build();

async function addUserRoleRequest(event: APIGatewayEvent) {
    const { id, roleId } = event.pathParameters;
    await addRole(id, roleId);
    return new SuccessResponse({ message: 'Role added successfully' });
}

export const addRole = async (userId: string, roleId: string) => {
    const verifyRole = await db
        .selectFrom('role')
        .select('id')
        .where('id', '=', roleId)
        .executeTakeFirst();

    if (!verifyRole) {
        throw new BadRequestError(`Invalid role id: ${roleId}`);
    }

    await db
        .insertInto('person_role')
        .values({ user_id: userId, role_id: roleId })
        .execute();
};
