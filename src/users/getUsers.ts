import { Authorizer } from '../util/middleware/authorizer';
import { InputValidator } from '../util/middleware/inputValidator';
import { getDatabase } from '../util/db';
import { IPersonQuery } from '../util/types/general';
import {LambdaBuilder, LambdaInput} from '../util/middleware/middleware';
import { APIResponse, SuccessResponse } from '../util/middleware/response';
import { PaginationHelper, ResponseMetaTagger } from '../util/middleware/paginationHelper';

const db = getDatabase();

const DEFAULT_LIMIT = 50;
const OFFSET = 0;
export const handler = new LambdaBuilder(getRequest)
    .use(new InputValidator())
    .use(new Authorizer())
    .use(new PaginationHelper({ limit: DEFAULT_LIMIT, offset: OFFSET}))
    .useAfter(new ResponseMetaTagger())
    .build();

export async function getRequest(
    event: LambdaInput
): Promise<APIResponse> {
    const personQuery = ((event && event.queryStringParameters) ||
        {}) as unknown as IPersonQuery;
    return new SuccessResponse(await getAll(personQuery));
}

export async function getAll(personQuery: IPersonQuery) {
    const res = await db
        .selectFrom('person')
        .select( [
            'person.id',
            'person.email',
            'person.created_at',
            'person.updated_at',
            'person.member_since'
            ])
        .limit(personQuery.limit || 10)
        .offset(personQuery.offset || 0)
        .execute();

    return res.map((user) => {
        return {
            id: user.id,
            email: user.email || '',
            created_at: user.created_at,
            updated_at: user.updated_at,
            member_since: user.member_since,
        };
    });
}
