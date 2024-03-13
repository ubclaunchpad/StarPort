import { LambdaBuilder } from '../util/middleware/middleware';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { APIResponse, SuccessResponse, APIErrorResponse } from '../util/middleware/response';
import { Authorizer } from '../util/middleware/authorizer';
import { InputValidator } from '../util/middleware/inputValidator';
import { getDatabase } from '../util/db';

const db = getDatabase();

export const handler = new LambdaBuilder(updateAreaRequest)
    .use(new InputValidator())
    // .use(new Authorizer()) 
    .build();

export async function updateAreaRequest(
    event: APIGatewayProxyEvent
): Promise<APIResponse> {
    if (event === null || event.pathParameters === null || event.body === null) {
        throw new Error('Invalid request');
    }

    const areaId = event.pathParameters;
    const updatedData = JSON.parse(event.body);

    try {
        await updateArea(areaId as unknown as number, updatedData);
        return new SuccessResponse({ message: 'Area updated successfully' });
    } catch (error) {
        console.error('Error in updateArea:', error);
        return new APIErrorResponse(error);
    }
}

export async function updateArea(areaId: number, updatedData: any) {
    const existingArea = await db
        .selectFrom('Area')
        .select('id')
        .where('id', '=', areaId)
        .executeTakeFirst();

    if (!existingArea) {
        throw new Error(`User with id ${areaId} not found`);
    }

    const res = await db
        .updateTable('Area')
        .set(updatedData)
        .where('id', '=', areaId)
        .execute();
}
