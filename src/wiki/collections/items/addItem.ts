import { LambdaBuilder } from '../../../util/middleware/middleware';
import { APIGatewayProxyEvent } from 'aws-lambda';
import {
    APIResponse,
    SuccessResponse,
    APIErrorResponse,
} from '../../../util/middleware/response';
import { Authorizer } from '../../../util/middleware/authorizer';
import { InputValidator } from '../../../util/middleware/inputValidator';
import { UpdateCollection, getDatabase } from '../../../util/db';
import { NewCollectionItem } from '../../../util/db';

const db = getDatabase();

export const handler = new LambdaBuilder(addCollectionItemRequest)
    .use(new InputValidator())
    .use(new Authorizer(db))
    .build();

export async function addCollectionItemRequest(
    event: APIGatewayProxyEvent
): Promise<APIResponse> {
    if (
        event === null ||
        event.pathParameters === null ||
        event.body === null
    ) {
        throw new Error('Invalid request');
    }

    const collectionId = event.pathParameters.collectionid;
    const updatedData = JSON.parse(event.body);

    try {
        await addCollectionItem({
            collectionId: collectionId as unknown as number,
            ...updatedData,
        });
        return new SuccessResponse({
            message: `item added successfully to collection ${collectionId}`,
        });
    } catch (error) {
        console.error('Error in addCollectionItem:', error);
        return new APIErrorResponse(error);
    }
}

export async function addCollectionItem(newCollectionItem: NewCollectionItem) {
    await db.insertInto('collection_item').values(newCollectionItem).execute();
}
