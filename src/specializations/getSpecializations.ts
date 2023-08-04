import { getDatabase } from '../util/db';
import { LambdaBuilder } from '../util/middleware/middleware';
import { SuccessResponse } from '../util/middleware/response';
import { InputValidator } from '../util/middleware/inputValidator';
import { specializations, refreshCache } from './specializations';

const db = getDatabase();
export const handler = new LambdaBuilder(getSpecializationRequest)
    .use(new InputValidator())
    .build();

async function getSpecializationRequest() {
    return new SuccessResponse(await getSpecializations());
}

export async function getSpecializations() {
    if (!specializations) {
        await refreshCache(db);
    }
    return specializations;
}
