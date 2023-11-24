import { getDatabase, UpdateRole } from '../util/db';
import { LambdaBuilder } from '../util/middleware/middleware';
import { SuccessResponse } from '../util/middleware/response';
import { InputValidator } from '../util/middleware/inputValidator';
import { getRoles, refreshCache } from './roles';
import { APIGatewayEvent } from 'aws-lambda';
import { Authorizer } from '../util/middleware/authorizer';

const db = getDatabase();
export const handler = new LambdaBuilder(updateRoleRequest)
    .use(new InputValidator())
    .use(new Authorizer())
    .build();

async function updateRoleRequest(event: APIGatewayEvent) {
    const { label } = JSON.parse(event.body);
    const { id } = event.pathParameters;
    await updateRole({ id, label });
    await refreshCache(db);
    return new SuccessResponse(await getRoles(db));
}

export const updateRole = async (updateRole: UpdateRole) => {
    await db
        .updateTable('role')
        .set(updateRole)
        .where('id', '=', updateRole.id)
        .execute();
};
