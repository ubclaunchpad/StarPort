import { Database } from '../util/db';
import { Kysely } from 'kysely';

export let faculties;
export const refreshCache = async (db: Kysely<Database>) => {
    faculties = (await db.selectFrom('faculty').selectAll().execute()) as {
        id: string;
        label: string;
    }[];
};

export const getFaculties = async (db: Kysely<Database>) => {
    if (!faculties) {
        await refreshCache(db);
    }
    return faculties;
};
