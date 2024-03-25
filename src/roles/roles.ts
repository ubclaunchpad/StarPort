import { Database } from '../util/db';
import { Kysely } from 'kysely';

export let roles;
export const refreshCache = async (db: Kysely<Database>) => {
    roles = (await db.selectFrom('role').selectAll().execute()) as {
        id: string;
        label: string;
    }[];

    for (const role of roles) {
        role.scopes = await attachScopes(db, role.label);
    }
};

export const getRoles = async (db: Kysely<Database>) => {
    if (!roles) {
        await refreshCache(db);
    }
    return roles;
};

export const attachScopes = async (db: Kysely<Database>, role: string) => {
    const scopes = await db
        .selectFrom('scope_role')
        .select(['scope_label'])
        .where('role_label', '=', role)
        .execute();
    return scopes.map((scope) => scope.scope_label);
};
