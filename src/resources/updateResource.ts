import * as dbConnection from '../util/db';
import { LambdaBuilder, LambdaInput } from '../util/middleware/middleware';
import { SuccessResponse } from '../util/middleware/response';
import { InputValidator } from '../util/middleware/inputValidator';
import { Resource, mapResource } from './mapper';

let db = dbConnection.getDatabase();
export const handler = new LambdaBuilder(DeleteResourceRequest)
    .use(new InputValidator())
    .build();

async function DeleteResourceRequest(event: LambdaInput) {
    if (!event.pathParameters || !event.pathParameters.rname) {
        throw new Error('Missing resource name');
    }

    if (!event.pathParameters.id) {
        throw new Error('Missing resource id');
    }

    const resource = mapResource(event.pathParameters.rname);

    return new SuccessResponse(
        await DeleteResource(resource, Number(event.pathParameters.id))
    );
}

export async function DeleteResource(resource: Resource, id: number) {
    db = dbConnection.getDatabase();
    const resourceData = await db
        .deleteFrom(resource)
        .where('id', '=', id)
        .execute();

    return resourceData;
}
