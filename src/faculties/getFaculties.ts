import { getDatabase } from '../util/db';
import { LambdaBuilder } from '../util/middleware/middleware';
import { SuccessResponse } from '../util/middleware/response';
import { InputValidator } from '../util/middleware/inputValidator';
import { faculties, refreshCache } from './faculties';

const db = getDatabase();
export const handler = new LambdaBuilder(getFacultyRequest)
    .use(new InputValidator())
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
