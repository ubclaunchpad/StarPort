import { LambdaBuilder } from '../../util/middleware/middleware';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { APIResponse, SuccessResponse } from '../../util/middleware/response';
import { Authorizer } from '../../util/middleware/authorizer';
import { InputValidator } from '../../util/middleware/inputValidator';
import { jsonArrayFrom } from 'kysely/helpers/mysql';
import { Database, getDatabase } from '../../util/db';
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
        .select((eb) => [
            'area.id',
            'area.name',
            'area.description',
            'area.updatedat',
            jsonArrayFrom(
                eb
                    .selectFrom('area as sub_area')
                    .select([
                        'sub_area.id',
                        'sub_area.name',
                        'sub_area.description',
                        'sub_area.updatedat',
                    ])
                    .whereRef('sub_area.parent_areaid', '=', 'area.id')
            ).as('areas'),
            jsonArrayFrom(
                eb
                    .selectFrom('document')
                    .select([
                        'document.id',
                        'document.title',
                        'document.fileid',
                        'document.updatedat',
                    ])
                    .whereRef('document.areaid', '=', 'area.id')
            ).as('documents'),
        ])
        .where('id', '=', areaId)
        .executeTakeFirst();

    if (!res) {
        throw new Error('Area not found');
    }

    return res;
}
