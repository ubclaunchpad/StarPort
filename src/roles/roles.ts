import { Database } from '../util/db';
import { Kysely } from 'kysely';

export let roles;
export const refreshCache = async (db: Kysely<Database>) => {
    roles = (await db.selectFrom('role').selectAll().execute()) as {
        id: string;
        label: string;
    }[];
};

export const getRoles = async (db: Kysely<Database>) => {
    if (!roles) {
        await refreshCache(db);
    }
    return roles;
};
