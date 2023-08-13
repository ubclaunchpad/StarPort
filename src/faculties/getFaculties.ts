import { getDatabaseParser } from '../util/db';
import { LambdaBuilder } from '../util/middleware/middleware';
import { SuccessResponse } from '../util/middleware/response';
import { InputValidator } from '../util/middleware/inputValidator';
import { faculties, refreshCache } from './faculties';
import { ConnectionHandler } from '../util/middleware/connectionHandler';

const db = getDatabaseParser();
export const handler = new LambdaBuilder(getFacultyRequest)
    .use(new InputValidator())
    .useAfter(new ConnectionHandler(db))
    .build();

async function getFacultyRequest() {
    return new SuccessResponse(await getFaculties());
}

export async function getFaculties() {
    if (!faculties) {
        await refreshCache(db);
    }
    return faculties;
}
