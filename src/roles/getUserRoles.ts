import { getDatabase } from '../util/db';
import { LambdaBuilder } from '../util/middleware/middleware';
import { SuccessResponse } from '../util/middleware/response';
import { InputValidator } from '../util/middleware/inputValidator';
import { APIGatewayEvent } from 'aws-lambda';
import { Authorizer } from '../util/middleware/authorizer';

const db = getDatabase();
export const handler = new LambdaBuilder(getUserRoleRequest)
    .use(new InputValidator())
    .use(new Authorizer())
    .build();

async function getUserRoleRequest(event: APIGatewayEvent) {
    const {id} = event.pathParameters;
    const role = await getUserRoles(id);
    return new SuccessResponse(role);
}

export const getUserRoles = async (userId: string) => {
    return await db
        .selectFrom('person_role')
        .innerJoin('role', 'role.id',  'person_role.role_id')
        .select(['role.id', 'role.label'])
        .where('user_id', '=', userId)
        .execute();
};
