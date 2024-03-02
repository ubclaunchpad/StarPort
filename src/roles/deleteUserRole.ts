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
const validScopes = [ACCESS_SCOPES.ADMIN_WRITE];
export const handler = new LambdaBuilder(deleteUserRoleRequest)
    .use(new InputValidator())
    .use(new Authorizer(db))
    .use(new ScopeController(db))
    .build();

async function deleteUserRoleRequest(event: LambdaInput) {
    if (!event.pathParameters) {
        throw new BadRequestError('Event pathParameters missing');
    }
    if (!event.pathParameters.id || !event.pathParameters.roleId) {
        throw new BadRequestError('User id or role id missing');
    }

    const { id, roleId } = event.pathParameters;
    ScopeController.verifyScopes(event.userScopes, validScopes);
    await deleteUserRole(parseInt(id), parseInt(roleId));
    return new SuccessResponse({ message: 'Role deleted successfully' });
}

export const deleteUserRole = async (userId: number, roleId: number) => {
    const verifyRole = await db
        .selectFrom('person_role')
        .select(['person_id', 'role_id'])
        .where('person_id', '=', userId)
        .where('role_id', '=', roleId)
        .executeTakeFirst();
    if (!verifyRole) {
        throw new BadRequestError(
            `role id: ${roleId} does not exist for user id: ${userId}`
        );
    }

    await db
        .deleteFrom('person_role')
        .where('person_id', '=', userId)
        .where('role_id', '=', roleId)
        .execute();
};
