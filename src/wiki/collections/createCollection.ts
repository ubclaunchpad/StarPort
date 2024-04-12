import { LambdaBuilder } from '../../util/middleware/middleware';
import { APIGatewayProxyEvent } from 'aws-lambda';
import {
    APIResponse,
    SuccessResponse,
    APIErrorResponse,
} from '../../util/middleware/response';
import { Authorizer } from '../../util/middleware/authorizer';
import { NewCollection, getDatabase } from '../../util/db';

const db = getDatabase();

export const handler = new LambdaBuilder(router)
    .use(new Authorizer(db))
    .build();

export async function router(
    event: APIGatewayProxyEvent
): Promise<APIResponse> {
    if (event === null || event.body === null) {
        throw new Error('Invalid request');
    }

    try {
        const collectionData = JSON.parse(event.body);
        const newCollectionId = await createCollection(collectionData);
        return new SuccessResponse({
            collectionId: newCollectionId,
            message: 'Collection created successfully',
        });
    } catch (error) {
        console.error('Error in createArea:', error);
        return new APIErrorResponse(error);
    }
}

export const createCollection = async (newCollection: NewCollection) => {
    try {
        const { insertId } = await db
            .insertInto('collection')
            .values(newCollection)
            .executeTakeFirst();
        return insertId;
    } catch (error) {
        console.log(error);
        throw new Error('Error creating collection');
    }
};
