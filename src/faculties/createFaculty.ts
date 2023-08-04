import { getDatabase, NewFaculty } from '../util/db';
import { LambdaBuilder } from '../util/middleware/middleware';
import { SuccessResponse } from '../util/middleware/response';
import { InputValidator } from '../util/middleware/inputValidator';
import { getFaculties, refreshCache } from './faculties';
import { APIGatewayEvent } from 'aws-lambda';
import { Authorizer } from '../util/middleware/authorizer';
import {ConnectionHandler} from "../util/middleware/connectionHandler";

const db = getDatabase();
export const handler = new LambdaBuilder(createFacultyRequest)
    .use(new InputValidator())
    .use(new Authorizer())
    .useAfter(new ConnectionHandler(db))
    .build();

async function createFacultyRequest(event: APIGatewayEvent) {
    const { label } = JSON.parse(event.body);
    await createFaculty({ label });
    await refreshCache(db);
    return new SuccessResponse(await getFaculties(db));
}

export const createFaculty = async (newFaculty: NewFaculty) => {
    const { id } = await db
        .insertInto('faculty')
        .values(newFaculty)
        .returning('id')
        .executeTakeFirst();
    return id;
};
