import {Database, getDatabase} from '../util/db';
import { LambdaBuilder } from '../util/middleware/middleware';
import { SuccessResponse } from '../util/middleware/response';
import { InputValidator } from '../util/middleware/inputValidator';
import { APIGatewayEvent } from 'aws-lambda';
import { Authorizer } from '../util/middleware/authorizer';
import {Kysely} from "kysely";

const db = getDatabase();
export const handler = new LambdaBuilder(getUserRoleRequest)
    .use(new InputValidator())
    .use(new Authorizer())
    .build();

async function getUserRoleRequest(event: APIGatewayEvent) {
    const {id} = event.pathParameters;
    const roles = await getUserRoles(id);
    const userRoles: {id: string, label: string, scopes: string[]}[] = [];
    roles.map(role => userRoles.push({id: role.id, label: role.label, scopes: []}));
    for (const role of userRoles) {
        role.scopes = await attachScopes(db, role.label);
    }
    return new SuccessResponse(userRoles);
}

export const getUserRoles = async (userId: string) => {
    return await db
        .selectFrom('person_role')
        .innerJoin('role', 'role.id',  'person_role.role_id')
        .select(['role.id', 'role.label'])
        .where('user_id', '=', userId)
        .execute();
};

export const attachScopes = async (db: Kysely<Database>, role: string) => {
    const scopes = await db.selectFrom('scope_role').select(['scope_label']).where('role_label', '=', role).execute();
    return scopes.map(scope => scope.scope_label);
}
