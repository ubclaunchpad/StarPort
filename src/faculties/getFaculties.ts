import { getDatabase } from '../util/db';
import { LambdaBuilder, LambdaInput } from '../util/middleware/middleware';
import { SuccessResponse } from '../util/middleware/response';
import { InputValidator } from '../util/middleware/inputValidator';
import { PaginationHelper, PaginationParams, ResponseMetaTagger,  } from '../util/middleware/paginationHelper';

const DEFAULT_OFFSET = 0;
const DEFAULT_LIMIT = 30;
const db = getDatabase();
export const handler = new LambdaBuilder(getFacultyRequest)
    .use(new InputValidator())
    .use(new PaginationHelper({ limit: DEFAULT_LIMIT, offset: DEFAULT_OFFSET}))
    .useAfter(new ResponseMetaTagger())
    .build();

async function getFacultyRequest(event: LambdaInput) {
    if (event.pagination) {
        const count = await countFaculties();
        event.pagination.count = count;
    }

    return new SuccessResponse(await getFaculties(event.pagination as PaginationParams));
}

export async function getFaculties(pagination: PaginationParams) {
    const faculties = (await db.selectFrom('faculty')
    .limit(pagination.limit)
    .offset(pagination.offset)
    .selectAll().execute()) as {
        id: string;
        label: string;
    }[];
    return faculties;
}

async function countFaculties() {
    const ret = await db.selectFrom('faculty')
    .select(({ fn }) => [
      fn.count<number>('id').as('count'),
    ])
    .executeTakeFirst();
    if (!ret) {
      throw new Error('Unable to count faculties');
    }
    return Number(ret.count);
}
