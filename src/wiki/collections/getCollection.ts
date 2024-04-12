import { getDatabase } from '../../util/db';
import { jsonArrayFrom } from 'kysely/helpers/postgres';
import { LambdaBuilder, LambdaInput } from '../../util/middleware/middleware';
import {
    APIResponse,
    SuccessResponse,
    APIErrorResponse,
} from '../../util/middleware/response';
import {
    PaginationHelper,
    ResponseMetaTagger,
} from '../../util/middleware/paginationHelper';
import { Authorizer } from '../../util/middleware/authorizer';

const db = getDatabase();

const LIMIT = 50;
const OFFSET = 0;

export const handler = new LambdaBuilder(getCollectionRequest)
    .use(new Authorizer(db))
    .use(new PaginationHelper({ limit: LIMIT, offset: OFFSET }))
    .useAfter(new ResponseMetaTagger())
    .build();

export async function getCollectionRequest(
    event: LambdaInput
): Promise<APIResponse> {
    try {
        if (event === null) {
            throw new Error('event not found');
        }

        if (
            event.pathParameters === null ||
            !event.pathParameters.collectionid
        ) {
            throw new Error('Request is missing params');
        }

        const collectionid = event.pathParameters.collectionid;
        return new SuccessResponse(
            await getCollection(collectionid as unknown as number)
        );
    } catch (error) {
        console.error('Error in getRequest:', error);
        return new APIErrorResponse(error);
    }
}

export async function getCollection(collectionid: number) {
    const res = await db
        .selectFrom('collection')
        .select((eb) => [
            'collection.id',
            'collection.name',
            'collection.description',
            'collection.updated_at',
            jsonArrayFrom(
                eb
                    .selectFrom('collection_item')
                    .selectAll()
                    .whereRef(
                        'collection_item.collectionid',
                        '=',
                        'collection.id'
                    )
                    .innerJoin(
                        'document',
                        'document.id',
                        'collection_item.itemid'
                    )
            ).as('items'),
        ])
        .where('id', '=', collectionid)
        .execute();
    return res;
}
