import { getDatabase } from '../util/db';
import { LambdaBuilder } from '../util/middleware/middleware';
import { SuccessResponse } from '../util/middleware/response';
import { InputValidator } from '../util/middleware/inputValidator';
import { getRoles, refreshCache } from './roles';
import { APIGatewayEvent } from 'aws-lambda';
import { Authorizer } from '../util/middleware/authorizer';

const db = getDatabase();
export const handler = new LambdaBuilder(deleteRoleRequest)
    .use(new InputValidator())
    .use(new Authorizer())
    .build();

async function deleteRoleRequest(event: APIGatewayEvent) {
    const { id } = event.pathParameters;
    await deleteRole(id);
    await refreshCache(db);
    return new SuccessResponse(await getRoles(db));
}

export const deleteRole = async (id: string) => {
    await db.deleteFrom('role').where('id', '=', id).execute();
};
