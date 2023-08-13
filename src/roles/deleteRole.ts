import { getDatabaseParser } from '../util/db';
import { LambdaBuilder, LambdaInput } from '../util/middleware/middleware';
import { SuccessResponse } from '../util/middleware/response';
import { InputValidator } from '../util/middleware/inputValidator';
import { getRoles, refreshCache } from './roles';
import { Authorizer } from '../util/middleware/authorizer';
import { ScopeController } from '../util/middleware/scopeHandler';

const db = getDatabaseParser();
export const handler = new LambdaBuilder(deleteRoleRequest)
    .use(new InputValidator())
    .use(new Authorizer())
    .use(new ScopeController(db))
    .build();

async function deleteRoleRequest(event: LambdaInput) {
    ScopeController.verifyScopes(event.userScopes, ['admin:write']);
    const { id } = event.pathParameters;
    await deleteRole(id);
    await refreshCache(db);
    return new SuccessResponse(await getRoles(db));
}

export const deleteRole = async (id: string) => {
    await db.deleteFrom('role').where('id', '=', id).execute();
};
