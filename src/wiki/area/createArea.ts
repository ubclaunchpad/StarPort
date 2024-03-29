import { LambdaBuilder } from '../../util/middleware/middleware';
import { APIGatewayProxyEvent } from 'aws-lambda';
import {
    APIResponse,
    SuccessResponse,
    APIErrorResponse,
} from '../../util/middleware/response';
import { Authorizer } from '../../util/middleware/authorizer';
import { NewArea, getDatabase } from '../../util/db';

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
        const areaData = JSON.parse(event.body);
        const newAreaId = await createArea(areaData);
        return new SuccessResponse({
            areaID: newAreaId,
            message: 'Area created successfully',
        });
    } catch (error) {
        console.error('Error in createArea:', error);
        return new APIErrorResponse(error);
    }
}

export const createArea = async (areaData: NewArea) => {
    try {
        const { insertId } = await db
            .insertInto('area')
            .values(areaData)
            .executeTakeFirst();
        return insertId;
    } catch (error) {
        console.log(error);
        throw new Error('Error creating area');
    }
};
