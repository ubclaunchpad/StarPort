import { LambdaBuilder } from '../../util/middleware/middleware';
import { APIGatewayProxyEvent } from 'aws-lambda';
import {
    APIResponse,
    SuccessResponse,
    APIErrorResponse,
} from '../../util/middleware/response';
import { Authorizer } from '../../util/middleware/authorizer';
import { InputValidator } from '../../util/middleware/inputValidator';
import { UpdateCollection, getDatabase } from '../../util/db';

const db = getDatabase();

export const handler = new LambdaBuilder(updateCollectionRequest)
    .use(new InputValidator())
    .use(new Authorizer(db))
    .build();

export async function updateCollectionRequest(
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
        await updateCollection(collectionId as unknown as number, updatedData);
        return new SuccessResponse({ message: 'Area updated successfully' });
    } catch (error) {
        console.error('Error in updateArea:', error);
        return new APIErrorResponse(error);
    }
}

export async function updateCollection(
    collectionId: number,
    updatedData: UpdateCollection
) {
    await db
        .updateTable('collection')
        .set(updatedData)
        .where('id', '=', collectionId)
        .execute();
}
