import * as dbConnection from '../util/db';
import { LambdaBuilder, LambdaInput } from '../util/middleware/middleware';
import { SuccessResponse } from '../util/middleware/response';
import { InputValidator } from '../util/middleware/inputValidator';
import {
    PaginationHelper,
    PaginationParams,
    ResponseMetaTagger,
} from '../util/middleware/paginationHelper';
import { Resource, mapResource } from './mapper';

const DEFAULT_OFFSET = 0;
const DEFAULT_LIMIT = 30;
let db = dbConnection.getDatabase();
export const handler = new LambdaBuilder(getResourcesRequest)
    .use(new InputValidator())
    .use(new PaginationHelper({ limit: DEFAULT_LIMIT, offset: DEFAULT_OFFSET }))
    .useAfter(new ResponseMetaTagger())
    .build();

async function getResourcesRequest(event: LambdaInput) {
    if (!event.pathParameters || !event.pathParameters.rname) {
        throw new Error('Missing resource name');
    }

    const resource = mapResource(event.pathParameters.rname);

    if (event.pagination) {
        const count = await countResources(resource);
        event.pagination.count = count;
    }

    return new SuccessResponse(
        await getResources(resource, event.pagination as PaginationParams)
    );
}

export async function getResources(
    resource: Resource,
    pagination: PaginationParams
) {
    db = dbConnection.getDatabase();
    const resources = (await db
        .selectFrom(resource)
        .limit(pagination.limit)
        .offset(pagination.offset)
        .selectAll()
        .execute()) as {
        id: number;
        label: string;
    }[];
    return resources;
}

async function countResources(resource: Resource) {
    const ret = await db
        .selectFrom(resource)
        .select(({ fn }) => [fn.count<number>('id').as('count')])
        .executeTakeFirst();
    if (!ret) {
        throw new Error(`Unable to count ${resource}`);
    }
    return Number(ret.count);
}
