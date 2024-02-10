import { APIGatewayEvent } from 'aws-lambda';
import { getDatabase } from '../util/db';
import { InputValidator } from '../util/middleware/inputValidator';
import { LambdaBuilder } from '../util/middleware/middleware';
import { BadRequestError, SuccessResponse } from '../util/middleware/response';

const db = getDatabase();
export const handler = new LambdaBuilder(addUserRoleRequest)
    .use(new InputValidator())
    // .use(new Authorizer())
    .build();

async function addUserRoleRequest(event: APIGatewayEvent) {
    if (!event.pathParameters) {
        throw new BadRequestError('Event path parameters missing');
    }
    if (!event.pathParameters.id || !event.pathParameters.roleId) {
        throw new BadRequestError('User id or role id missing');
    }
    const { id, roleId } = event.pathParameters;
    await addRole(parseInt(id), parseInt(roleId));
    return new SuccessResponse({ message: 'Role added successfully' });
}

export const addRole = async (userId: number, roleId: number) => {
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
        .values({ person_id: userId, role_id: roleId })
        .execute();
};
