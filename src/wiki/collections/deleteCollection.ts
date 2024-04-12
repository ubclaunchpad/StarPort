import { getDatabase } from '../../util/db';
import { LambdaBuilder } from '../../util/middleware/middleware';
import {
    SuccessResponse,
    APIErrorResponse,
} from '../../util/middleware/response';
import { APIGatewayEvent } from 'aws-lambda';
import { Authorizer } from '../../util/middleware/authorizer';

const db = getDatabase();

export const handler = new LambdaBuilder(deleteCollectionRequest)
    .use(new Authorizer(db))
    .build();

async function deleteCollectionRequest(event: APIGatewayEvent) {
    if (event === null || event.pathParameters === null) {
        throw new Error('Invalid request');
    }

    if (!event.pathParameters.areaid) {
        throw new Error('Request is missing parameters');
    }

    const { collectionid } = event.pathParameters;

    try {
        await deleteCollection(Number(collectionid));
        return new SuccessResponse({
            message: `Collection ${collectionid} deleted`,
        });
    } catch (error) {
        console.error('Error in deleteCollection:', error);
        return new APIErrorResponse(error);
    }
}

export async function deleteCollection(collectionId: number) {
    await db.deleteFrom('collection').where('id', '=', collectionId).execute();
}
