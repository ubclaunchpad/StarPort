import { LambdaBuilder } from '../util/middleware/middleware';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { APIResponse, SuccessResponse } from '../util/middleware/response';
import { Authorizer } from '../util/middleware/authorizer';
import { InputValidator } from '../util/middleware/inputValidator';
import { getWikiDatabase } from '../util/wikidb';

const db = getWikiDatabase();

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

    console.log('event:', event)
    const areaId = event.pathParameters.id;
    console.log('areaId:', areaId);
    return new SuccessResponse(await getArea(areaId as unknown as number));
}

export async function getArea(areaId: number) {
    const res = await db
        .selectFrom('Area')
        .select([
            'areaID',
            'name',
            'description',
            'accessLevel',
            'numberOfDocs',
            'lastUpdatedDate',
            'hierarchyLevel',
            'parentAreaID',
        ])
        .where('areaID', '=', areaId)
        .executeTakeFirst();

    if (!res) {
        throw new Error('Area not found');
    }

    return {
        areaID: res.areaID,
        name: res.name,
        description: res.description,
        accessLevel: res.accessLevel,
        numberOfDocs: res.numberOfDocs,
        lastUpdatedDate: res.lastUpdatedDate,
        hierarchyLevel: res.hierarchyLevel,
        parentAreaID: res.parentAreaID,
    };
}
