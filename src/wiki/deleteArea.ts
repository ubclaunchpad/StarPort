import { getWikiDatabase } from '../util/wikidb';
import { LambdaBuilder } from '../util/middleware/middleware';
import { SuccessResponse, APIErrorResponse } from '../util/middleware/response';
import { InputValidator } from '../util/middleware/inputValidator';
import { APIGatewayEvent } from 'aws-lambda';
import { Authorizer } from '../util/middleware/authorizer';

const db = getWikiDatabase();

export const handler = new LambdaBuilder(deleteArea)
    .use(new InputValidator())
    .use(new Authorizer())
    .build();

async function deleteAreaRequest(event: APIGatewayEvent) {
    if (event === null || event.pathParameters === null) {
        throw new Error('Invalid request');
    }

    const { id } = event.pathParameters;

    try {
        await deleteArea(id);
        return new SuccessResponse({ message: `Area ${id} deleted` });
    } catch (error) {
        console.error('Error in deleteArea:', error);
        return new APIErrorResponse(error);
    }
}

export async function deleteArea(areaId: number) {
    await db.deleteFrom('Area').where('id', '=', areaId).execute();
}
