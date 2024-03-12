import { getDatabase } from '../util/db';
import { LambdaBuilder, LambdaInput } from '../util/middleware/middleware';
import { SuccessResponse } from '../util/middleware/response';
import { InputValidator } from '../util/middleware/inputValidator';
import {
    PaginationHelper,
    PaginationParams,
    ResponseMetaTagger,
} from '../util/middleware/paginationHelper';

const DEFAULT_OFFSET = 0;
const DEFAULT_LIMIT = 30;
const db = getDatabase();

export const handler = new LambdaBuilder(getSpecializationRequest)
    .use(new InputValidator())
    .use(new PaginationHelper({ limit: DEFAULT_LIMIT, offset: DEFAULT_OFFSET }))
    .useAfter(new ResponseMetaTagger())
    .build();

async function getSpecializationRequest(event: LambdaInput) {
    if (event.pagination) {
        const count = await countStandings();
        event.pagination.count = count;
    }

    return new SuccessResponse(
        await getStandings(event.pagination as PaginationParams)
    );
}

export async function getStandings(pagination: PaginationParams) {
    const specializations = (await db
        .selectFrom('standing')
        .limit(pagination.limit)
        .offset(pagination.offset)
        .selectAll()
        .execute()) as {
        id: number;
        label: string;
    }[];

    return specializations;
}

async function countStandings() {
    const ret = await db
        .selectFrom('standing')
        .select(({ fn }) => [fn.count<number>('id').as('count')])
        .executeTakeFirst();
    if (!ret) {
        throw new Error('Unable to count standings');
    }
    return Number(ret.count);
}
