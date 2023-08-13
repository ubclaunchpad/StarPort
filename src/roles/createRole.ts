import { getDatabaseParser, NewRole } from '../util/db';
import { LambdaBuilder, LambdaInput } from '../util/middleware/middleware';
import { SuccessResponse } from '../util/middleware/response';
import { InputValidator } from '../util/middleware/inputValidator';
import { getRoles, refreshCache } from './roles';
import { Authorizer } from '../util/middleware/authorizer';
import { ScopeController } from '../util/middleware/scopeHandler';

const db = getDatabaseParser();
export const handler = new LambdaBuilder(createRoleRequest)
    .use(new InputValidator())
    .use(new Authorizer())
    .use(new ScopeController(db))
    .build();

async function createRoleRequest(event: LambdaInput) {
    ScopeController.verifyScopes(event.userScopes, ['admin:write']);
    const { label } = JSON.parse(event.body);
    await createRole({ label });
    await refreshCache(db);
    return new SuccessResponse(await getRoles(db));
}

export const createRole = async (newRole: NewRole) => {
    const { id } = await db
        .insertInto('role')
        .values(newRole)
        .returning('id')
        .executeTakeFirst();
    return id;
};
