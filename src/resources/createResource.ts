import { APIGatewayEvent } from 'aws-lambda';
import { getDatabase, NewResource } from '../util/db';
import { InputValidator } from '../util/middleware/inputValidator';
import { LambdaBuilder } from '../util/middleware/middleware';
import { SuccessResponse } from '../util/middleware/response';
import { Authorizer } from '../util/middleware/authorizer';
import { mapResource, Resource } from './mapper';

let db = getDatabase();

export const handler = new LambdaBuilder(createResourceRequest)
    .use(new InputValidator())
    .use(new Authorizer(db))
    .build();

async function createResourceRequest(event: APIGatewayEvent) {
    if (!event.body) {
        throw new Error('Missing request body');
    }

    if (!event.pathParameters || !event.pathParameters.rname) {
        throw new Error('Missing resource name');
    }
    const { rname } = event.pathParameters;
    const resource = mapResource(event.pathParameters.rname);

    const { label } = JSON.parse(event.body);

    const id = await createResource(resource, { label });
    return new SuccessResponse({
        message: `Resource ${label} created with id: ${id} for ${rname}`,
    });
}

export const createResource = async (
    resource: Resource,
    newResource: NewResource
) => {
    db = getDatabase();
    const { insertId } = await db
        .insertInto(resource)
        .values(newResource)
        .executeTakeFirst();
    return insertId;
};
