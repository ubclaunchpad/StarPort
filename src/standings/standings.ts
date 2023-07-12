import { Kysely } from 'kysely';
import { Database } from '../util/db';

export let standings;

export const refreshCache = async (db: Kysely<Database>) => {
    standings = (await db.selectFrom('standing').selectAll().execute()) as {
        id: string;
        label: string;
    }[];
};

export const getStandings = async (db: Kysely<Database>) => {
    if (!standings) {
        await refreshCache(db);
    }
    return standings;
};
