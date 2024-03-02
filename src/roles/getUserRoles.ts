import { APIGatewayEvent } from 'aws-lambda';
import { Kysely } from 'kysely';
import { Database, getDatabase } from '../util/db';
import { InputValidator } from '../util/middleware/inputValidator';
import { LambdaBuilder } from '../util/middleware/middleware';
import { BadRequestError, SuccessResponse } from '../util/middleware/response';
import { Authorizer } from '../util/middleware/authorizer';

const db = getDatabase();
export const handler = new LambdaBuilder(getUserRoleRequest)
    .use(new InputValidator())
    .use(new Authorizer(db))
    .build();

async function getUserRoleRequest(event: APIGatewayEvent) {
    if (!event.pathParameters) {
        throw new BadRequestError('Event path parameters missing');
    }
    const { id } = event.pathParameters;
    const roles = await getUserRoles(Number(id));
    const userRoles: { id: number; label: string; scopes: string[] }[] = [];
    roles.map((role) =>
        userRoles.push({ id: role.id, label: role.label, scopes: [] })
    );
    for (const role of userRoles) {
        role.scopes = await attachScopes(db, role.label);
    }
    return new SuccessResponse(userRoles);
}

export const getUserRoles = async (userId: number) => {
    return await db
        .selectFrom('role')
        .innerJoin('person_role', 'role.id', 'person_role.role_id')
        .select(['role.id', 'role.label'])
        .where('person_role.person_id', '=', userId)
        .execute();
};

export const attachScopes = async (db: Kysely<Database>, role: string) => {
    const scopes = await db
        .selectFrom('scope_role')
        .select(['scope_label'])
        .where('role_label', '=', role)
        .execute();
    return scopes.map((scope) => scope.scope_label);
};
