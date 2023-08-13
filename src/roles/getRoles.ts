import { getDatabaseParser } from '../util/db';
import { LambdaBuilder } from '../util/middleware/middleware';
import { SuccessResponse } from '../util/middleware/response';
import { roles, refreshCache } from './roles';
import { ConnectionHandler } from '../util/middleware/connectionHandler';

const db = getDatabaseParser();
export const handler = new LambdaBuilder(getRolesRequest)
    .useAfter(new ConnectionHandler(db))
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
