import { getDatabase } from '../util/db';
import { LambdaBuilder } from '../util/middleware/middleware';
import { SuccessResponse } from '../util/middleware/response';
import { roles, refreshCache } from './roles';

const db = getDatabase();
export const handler = new LambdaBuilder(getRolesRequest)
    .build();

async function getRolesRequest() {
    return new SuccessResponse(await getRoles());
}

export async function getRoles() {
    if (!roles) {
        await refreshCache(db);
    }
    return roles;
}
