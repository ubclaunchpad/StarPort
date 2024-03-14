import { getDatabase } from '../util/db';
import { LambdaBuilder } from '../util/middleware/middleware';
import { SuccessResponse, APIErrorResponse } from '../util/middleware/response';
import { InputValidator } from '../util/middleware/inputValidator';
import { APIGatewayEvent } from 'aws-lambda';
import { Authorizer } from '../util/middleware/authorizer';

const db = getDatabase();

export const handler = new LambdaBuilder(deleteAreaRequest)
    .use(new InputValidator())
    .use(new Authorizer(db))
    .build();

async function deleteAreaRequest(event: APIGatewayEvent) {
    if (event === null || event.pathParameters === null) {
        throw new Error('Invalid request');
    }

    if (!event.pathParameters.areaid) {
        throw new Error('Request is missing parameters');
    }

    const { areaid } = event.pathParameters;

    try {
        await deleteArea(Number(areaid));
        return new SuccessResponse({ message: `Area ${areaid} deleted` });
    } catch (error) {
        console.error('Error in deleteArea:', error);
        return new APIErrorResponse(error);
    }
}

export async function deleteArea(areaId: number) {
    await db.deleteFrom('Area').where('id', '=', areaId).execute();
}
