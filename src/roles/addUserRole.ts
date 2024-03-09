import { getDatabase } from '../util/db';
import { Authorizer } from '../util/middleware/authorizer';
import { InputValidator } from '../util/middleware/inputValidator';
import { LambdaBuilder, LambdaInput } from '../util/middleware/middleware';
import { BadRequestError, SuccessResponse } from '../util/middleware/response';
import {
    ACCESS_SCOPES,
    ScopeController,
} from '../util/middleware/scopeHandler';

const db = getDatabase();

// Only valid for user with Admin role
const validScopes = [ACCESS_SCOPES.ADMIN_WRITE];

export const handler = new LambdaBuilder(addUserRoleRequest)
    .use(new InputValidator())
    .use(new Authorizer(db))
    .use(new ScopeController(db))
    .build();

async function addUserRoleRequest(event: LambdaInput) {
    if (!event.pathParameters) {
        throw new BadRequestError('Event path parameters missing');
    }
    if (!event.pathParameters.id || !event.pathParameters.roleId) {
        throw new BadRequestError('User id or role id missing');
    }
    const { id, roleId } = event.pathParameters;

    ScopeController.verifyScopes(event.userScopes, validScopes);

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
