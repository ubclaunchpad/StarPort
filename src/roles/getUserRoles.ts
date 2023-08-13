import { LambdaBuilder } from '../util/middleware/middleware';
import { SuccessResponse } from '../util/middleware/response';
import { InputValidator } from '../util/middleware/inputValidator';
import { APIGatewayEvent } from 'aws-lambda';
import { Authorizer } from '../util/middleware/authorizer';
import { Kysely } from 'kysely';
import { Database, getDatabaseParser, queryDatabaseAPI } from '../util/db';

const db = getDatabaseParser();
export const handler = new LambdaBuilder(getUserRoleRequest)
    .use(new InputValidator())
    .use(new Authorizer())
    .build();

async function getUserRoleRequest(event: APIGatewayEvent) {
    const { id } = event.pathParameters;
    const roles = await getUserRoles(id);
    const userRoles: { id: string; label: string; scopes: string[] }[] = [];
    roles.map((role) =>
        userRoles.push({ id: role.id, label: role.label, scopes: [] })
    );
    for (const role of userRoles) {
        role.scopes = await attachScopes(db, role.label);
    }
    return new SuccessResponse(userRoles);
}

export const getUserRoles = async (userId: string) => {
    const query = db
        .selectFrom('person_role')
        .innerJoin('role', 'role.id', 'person_role.role_id')
        .select(['role.id', 'role.label'])
        .where('user_id', '=', userId)
        .compile();

    return (await queryDatabaseAPI(query)).rows;
};

export const attachScopes = async (db: Kysely<Database>, role: string) => {
    const query = await db
        .selectFrom('scope_role')
        .select(['scope_label'])
        .where('role_label', '=', role)
        .compile();
    const scopes = (await queryDatabaseAPI(query)).rows;
    return scopes.map((scope) => scope.scope_label);
};
