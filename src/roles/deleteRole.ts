import { getDatabase } from '../util/db';
import { Authorizer } from '../util/middleware/authorizer';
import { InputValidator } from '../util/middleware/inputValidator';
import { LambdaBuilder, LambdaInput } from '../util/middleware/middleware';
import { BadRequestError, SuccessResponse } from '../util/middleware/response';
import {
    ACCESS_SCOPES,
    ScopeController,
} from '../util/middleware/scopeHandler';
import { getRoles, refreshCache } from './roles';

const db = getDatabase();

// Only valid for Admin role
const validScopes = [ACCESS_SCOPES.ADMIN_WRITE];
export const handler = new LambdaBuilder(deleteRoleRequest)
    .use(new InputValidator())
    .use(new Authorizer(db))
    .use(new ScopeController(db))
    .build();

async function deleteRoleRequest(event: LambdaInput) {
    if (!event.pathParameters) {
        throw new BadRequestError('Event path parameters missing');
    }
    if (!event.pathParameters.id) {
        throw new BadRequestError('ID is undefined');
    }
    const id = parseInt(event.pathParameters.id);

    ScopeController.verifyScopes(event.userScopes, validScopes);

    await deleteRole(id);
    await refreshCache(db);
    return new SuccessResponse(await getRoles(db));
}

export const deleteRole = async (id: number) => {
    await db.deleteFrom('role').where('id', '=', id).execute();
};
