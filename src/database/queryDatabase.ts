import { Database } from '../util/db';
import { LambdaBuilder, LambdaInput } from '../util/middleware/middleware';
import { DatabaseError, SuccessResponse } from '../util/middleware/response';
import { ConnectionHandler } from '../util/middleware/connectionHandler';
import { CompiledQuery, Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';

const db = createDatabaseConnection();
export const handler = new LambdaBuilder(queryDatabaseRequest)
    .useAfter(new ConnectionHandler(db))
    .build();

async function queryDatabaseRequest(event: LambdaInput) {
    const query = JSON.parse(event.body) as CompiledQuery;
    return new SuccessResponse(await queryDatabase(query));
}

export const queryDatabase = async (query: CompiledQuery) => {
    try {
        return await db.executeQuery(query);
    } catch (e) {
        throw new DatabaseError(e.message);
    }
};

function createDatabaseConnection() {
    const dialect = new PostgresDialect({
        pool: new Pool({
            connectionString: process.env.MAIN_DATABASE_URL,
            max: 3,
        }),
    });

    return new Kysely<Database>({ dialect });
}
