import { LambdaBuilder } from '../../../util/middleware/middleware';
import { APIGatewayProxyEvent } from 'aws-lambda';
import {
    APIResponse,
    SuccessResponse,
    APIErrorResponse,
} from '../../../util/middleware/response';
import { Authorizer } from '../../../util/middleware/authorizer';
import { InputValidator } from '../../../util/middleware/inputValidator';
import { getDatabase } from '../../../util/db';

const db = getDatabase();

export const handler = new LambdaBuilder(removeCollectionItemRequest)
    .use(new InputValidator())
    .use(new Authorizer(db))
    .build();

export async function removeCollectionItemRequest(
    event: APIGatewayProxyEvent
): Promise<APIResponse> {
    if (event === null || event.pathParameters === null) {
        throw new Error('Invalid request');
    }

    const collectionId = event.pathParameters.collectionid;
    const itemid = event.pathParameters.itemid;

    try {
        await removeCollectionItem(
            collectionId as unknown as number,
            itemid as unknown as number
        );
        return new SuccessResponse({
            message: `item removed successfully from collection ${collectionId}`,
        });
    } catch (error) {
        console.error('Error in removeCollectionItem:', error);
        return new APIErrorResponse(error);
    }
}

export async function removeCollectionItem(
    collectionId: number,
    itemid: number
) {
    await db
        .deleteFrom('collection_item')
        .where('collectionid', '=', collectionId)
        .where('itemid', '=', itemid)
        .execute();
}
