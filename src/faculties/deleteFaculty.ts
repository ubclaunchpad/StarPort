import { getDatabase } from '../util/db';
import { LambdaBuilder } from '../util/middleware/middleware';
import { SuccessResponse } from '../util/middleware/response';
import { InputValidator } from '../util/middleware/inputValidator';
import { getFaculties, refreshCache } from './faculties';
import { APIGatewayEvent } from 'aws-lambda';
import { Authorizer } from '../util/middleware/authorizer';
import {ConnectionHandler} from "../util/middleware/connectionHandler";

const db = getDatabase();
export const handler = new LambdaBuilder(deleteFacultyRequest)
    .use(new InputValidator())
    .use(new Authorizer())
    .useAfter(new ConnectionHandler(db))
    .build();

async function deleteFacultyRequest(event: APIGatewayEvent) {
    const { id } = JSON.parse(event.body);
    await deleteFaculty(id);
    await refreshCache(db);
    return new SuccessResponse(await getFaculties(db));
}

export const deleteFaculty = async (id: string) => {
    await db.deleteFrom('faculty').where('id', '=', id).execute();
};
