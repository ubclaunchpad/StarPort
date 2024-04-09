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
export const handler = new LambdaBuilder(getRequest)
    // .use(new InputValidator())
    .use(new Authorizer(db))
    .use(new PaginationHelper({ limit: LIMIT, offset: OFFSET }))
    .useAfter(new ResponseMetaTagger())
    .build();

export async function getRequest(event: LambdaInput): Promise<APIResponse> {
    try {
        const areaQuery = ((event && event.queryStringParameters) ||
            {}) as unknown as IAreaQuery;
        return new SuccessResponse(await getAll(areaQuery));
    } catch (error) {
        console.error('Error in getRequest:', error);
        return new APIErrorResponse(error);
    }
}

export async function getAll(areaQuery: IAreaQuery) {
    console.log('areaQuery:', areaQuery);
    console.log('db:', await db);
    const res = await db
        .selectFrom('area')
        .selectAll()
        .execute();
    return res;
}
