import { getDatabase } from '../util/db';
import { LambdaBuilder } from '../util/middleware/middleware';
import { SuccessResponse } from '../util/middleware/response';
import { InputValidator } from '../util/middleware/inputValidator';
import { APIGatewayEvent } from 'aws-lambda';
import { Authorizer } from '../util/middleware/authorizer';
import { Resource, mapResource } from './mapper';

const db = getDatabase();
export const handler = new LambdaBuilder(deleteResourceRequest)
    .use(new InputValidator())
    .use(new Authorizer(db))
    .build();

async function deleteResourceRequest(event: APIGatewayEvent) {
    if (!event.pathParameters || !event.pathParameters.rname) {
        throw new Error('Missing resource name');
    }

    if (!event.pathParameters || !event.pathParameters.id) {
        throw new Error('Missing resource id');
    }
    const { id, rname } = event.pathParameters;
    const resource = mapResource(rname);
    try {
        await deleteResource(resource, Number(id));
        return new SuccessResponse({
            message: `Resource ${id} deleted for ${rname}`,
        });
    } catch (e) {
        throw new Error(
            `Error deleting resource ${id} for ${rname}, ${e.message}`
        );
    }
}

export const deleteResource = async (resource: Resource, id: number) => {
    await db.deleteFrom(resource).where('id', '=', id).execute();
};
