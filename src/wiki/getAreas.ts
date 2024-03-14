import { InputValidator } from '../util/middleware/inputValidator';
import { getDatabase } from '../util/db';
import { IAreaQuery } from '../util/types/general';
import { LambdaBuilder, LambdaInput } from '../util/middleware/middleware';
import {
    APIResponse,
    SuccessResponse,
    APIErrorResponse,
} from '../util/middleware/response';
import {
    PaginationHelper,
    ResponseMetaTagger,
} from '../util/middleware/paginationHelper';

const db = getDatabase();

const LIMIT = 50;
const OFFSET = 0;
export const handler = new LambdaBuilder(getRequest)
    .use(new InputValidator())
    // .use(new Authorizer())
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
        .selectFrom('Area')
        .select([
            'Area.id',
            'Area.name',
            'Area.numberOfDocs',
            'Area.lastUpdatedDate',
            'Area.parentAreaID',
        ])
        // .limit(areaQuery.limit || 10)
        // .offset(areaQuery.offset || 0)
        .execute();

    return res.map((Area) => {
        return {
            id: Area.id,
            name: Area.name,
            numberOfDocs: Area.numberOfDocs,
            lastUpdatedDate: Area.lastUpdatedDate,
            parentAreaID: Area.parentAreaID,
        };
    });
}
