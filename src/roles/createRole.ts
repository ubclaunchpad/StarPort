import { getDatabase, NewRole } from '../util/db';
import { InputValidator } from '../util/middleware/inputValidator';
import { LambdaBuilder, LambdaInput } from '../util/middleware/middleware';
import { BadRequestError, SuccessResponse } from '../util/middleware/response';
import { ScopeController } from '../util/middleware/scopeHandler';
import { getRoles, refreshCache } from './roles';

const db = getDatabase();
export const handler = new LambdaBuilder(createRoleRequest)
    .use(new InputValidator())
    // .use(new Authorizer())
    .use(new ScopeController(db))
    .build();

async function createRoleRequest(event: LambdaInput) {
    if (!event.userScopes) {
        throw new BadRequestError('Event userScopes missing');
    }
    
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
