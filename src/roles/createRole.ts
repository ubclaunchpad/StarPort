import { getDatabase, NewRole } from '../util/db';
import { Authorizer } from '../util/middleware/authorizer';
import { InputValidator } from '../util/middleware/inputValidator';
import { LambdaBuilder, LambdaInput } from '../util/middleware/middleware';
import { BadRequestError, SuccessResponse } from '../util/middleware/response';
import { ScopeController } from '../util/middleware/scopeHandler';
import { getRoles, refreshCache } from './roles';
import { ACCESS_SCOPES } from '../util/middleware/scopeHandler';

const db = getDatabase();
export const handler = new LambdaBuilder(createRoleRequest)
    .use(new InputValidator())
    .use(new Authorizer(db))
    .use(new ScopeController(db))
    .build();

async function createRoleRequest(event: LambdaInput) {
    if (!event.userScopes) {
        throw new BadRequestError('Event userScopes missing');
    }
    if (!event.body) {
        throw new BadRequestError('Event body missing');
    }
    
    ScopeController.verifyScopes(event.userScopes, [ACCESS_SCOPES.ADMIN_WRITE, ACCESS_SCOPES.WRITE_PROFILE]);
    
    const { label } = JSON.parse(event.body);
    await createRole({ label });
    await refreshCache(db);
    return new SuccessResponse(await getRoles(db));
}

export const createRole = async (newRole: NewRole) => {
    const result = await db
        .insertInto('role')
        .values(newRole)
        .returning('id')
        .executeTakeFirst();

    if (result === undefined) {
        throw new BadRequestError('Role not created');
    }

    return result.id;
};
