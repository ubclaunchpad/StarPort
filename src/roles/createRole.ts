import { getDatabase, NewRole } from '../util/db';
import { LambdaBuilder } from '../util/middleware/middleware';
import { SuccessResponse } from '../util/middleware/response';
import { InputValidator } from '../util/middleware/inputValidator';
import { getRoles, refreshCache } from './roles';
import { APIGatewayEvent } from 'aws-lambda';
import { Authorizer } from '../util/middleware/authorizer';
import {ConnectionHandler} from "../util/middleware/connectionHandler";

const db = getDatabase();
export const handler = new LambdaBuilder(createRoleRequest)
    .use(new InputValidator())
    .use(new Authorizer())
    .useAfter(new ConnectionHandler(db))
    .build();

async function createRoleRequest(event: APIGatewayEvent) {
    const { label } = JSON.parse(event.body);
    await createRole({ label });
    await refreshCache(db);
    return new SuccessResponse(await getRoles(db));
}

export const createRole = async (newRole: NewRole) => {
    const { id } = await db
        .insertInto('role')
        .values(newRole)
        .returning('id')
        .executeTakeFirst();
    return id;
};
