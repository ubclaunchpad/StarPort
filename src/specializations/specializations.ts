import { Database } from '../util/db';
import { Kysely } from 'kysely';

export let specializations;

export const refreshCache = async (db: Kysely<Database>) => {
    specializations = (await db
        .selectFrom('specialization')
        .selectAll()
        .execute()) as {
        id: string;
        label: string;
    }[];
};

export const getSpecializations = async (db: Kysely<Database>) => {
    if (!specializations) {
        await refreshCache(db);
    }
    return specializations;
};
