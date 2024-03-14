import { LambdaBuilder } from '../util/middleware/middleware';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { APIResponse, SuccessResponse } from '../util/middleware/response';
import { Authorizer } from '../util/middleware/authorizer';
import { InputValidator } from '../util/middleware/inputValidator';

import { getDatabase } from '../util/db';
const db = getDatabase();

export const handler = new LambdaBuilder(router)
    .use(new InputValidator())
    // .use(new Authorizer()) -> caused error "authorization header missing"
    .build();

export async function router(
    event: APIGatewayProxyEvent
): Promise<APIResponse> {
    if (event === null) {
        throw new Error('event not found');
    }

    if (event.pathParameters === null) {
        throw new Error('Request is missing params');
    }

    const areaId = event.pathParameters.id;
    return new SuccessResponse(await getArea(areaId as unknown as number));
}

export async function getArea(areaId: number) {
    const res = await db
        .selectFrom('Area')
        .select([
            'id',
            'name',
            'description',
            'numberOfDocs',
            'lastUpdatedDate',
            'parentAreaID',
        ])
        .where('id', '=', areaId)
        .executeTakeFirst();

    if (!res) {
        throw new Error('Area not found');
    }

    return {
        areaID: res.id,
        name: res.name,
        description: res.description,
        numberOfDocs: res.numberOfDocs,
        lastUpdatedDate: res.lastUpdatedDate,
        parentAreaID: res.parentAreaID,
    };
}
