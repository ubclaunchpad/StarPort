import { LambdaBuilder } from '../../util/middleware/middleware';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { APIResponse, SuccessResponse } from '../../util/middleware/response';
import { Authorizer } from '../../util/middleware/authorizer';
import { InputValidator } from '../../util/middleware/inputValidator';

import { getDatabase } from '../../util/db';
const db = getDatabase();

export const handler = new LambdaBuilder(router)
    .use(new InputValidator())
    .use(new Authorizer(db))
    .build();

export async function router(
    event: APIGatewayProxyEvent
): Promise<APIResponse> {
    if (event === null) {
        throw new Error('event not found');
    }

    if (event.pathParameters === null || !event.pathParameters.areaid) {
        throw new Error('Request is missing params');
    }

    const areaid = event.pathParameters.areaid;
    return new SuccessResponse(await getArea(areaid as unknown as number));
}

export async function getArea(areaId: number) {
    const res = await db
        .selectFrom('area')
        .selectAll()
        .where('id', '=', areaId)
        .executeTakeFirst();

    if (!res) {
        throw new Error('Area not found');
    }

    return res;
}
