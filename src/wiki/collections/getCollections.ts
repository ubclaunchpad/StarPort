import { getDatabase } from '../../util/db';
import { IAreaQuery } from '../../util/types/general';
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

export const handler = new LambdaBuilder(getCollectionsRequest)
    .use(new Authorizer(db))
    .use(new PaginationHelper({ limit: LIMIT, offset: OFFSET }))
    .useAfter(new ResponseMetaTagger())
    .build();

export async function getCollectionsRequest(
    event: LambdaInput
): Promise<APIResponse> {
    try {
        const getCollectionsQuery = ((event && event.queryStringParameters) ||
            {}) as unknown as any;
        return new SuccessResponse(await getCollections(getCollectionsQuery));
    } catch (error) {
        console.error('Error in getRequest:', error);
        return new APIErrorResponse(error);
    }
}

export async function getCollections(getCollectionsQuery: any) {
    const res = await db
        .selectFrom('collection')
        .selectAll()
        .orderBy('collection.updated_at', 'desc')
        .execute();
    return res;
}
