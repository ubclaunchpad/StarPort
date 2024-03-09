import { getDatabase } from '../util/db';
import { Authorizer } from '../util/middleware/authorizer';
import { InputValidator } from '../util/middleware/inputValidator';
import { LambdaBuilder, LambdaInput } from '../util/middleware/middleware';
import {
    PaginationHelper,
    ResponseMetaTagger,
} from '../util/middleware/paginationHelper';
import { APIResponse, SuccessResponse } from '../util/middleware/response';
import { ScopeController } from '../util/middleware/scopeHandler';
import { IPersonQuery } from '../util/types/general';

const db = getDatabase();

const DEFAULT_LIMIT = 50;
const OFFSET = 0;
export const handler = new LambdaBuilder(getRequest)
    .use(new InputValidator())
    .use(new Authorizer(db))
    .use(new ScopeController(db))
    .use(new PaginationHelper({ limit: DEFAULT_LIMIT, offset: OFFSET }))
    .useAfter(new ResponseMetaTagger())
    .build();

export async function getRequest(event: LambdaInput): Promise<APIResponse> {
    const personQuery = ((event && event.queryStringParameters) ||
        {}) as unknown as IPersonQuery;
    return new SuccessResponse(await getAll(personQuery));
}

export async function getAll(personQuery: IPersonQuery) {
    const res = await db
        .selectFrom('person')
        .select([
            'person.id',
            'person.first_name',
            'person.last_name',
            'person.pref_name',
            'person.email',
            'person.account_updated',
            'person.member_since',
        ])
        .limit(personQuery.limit || 10)
        .offset(personQuery.offset || 0)
        .execute();

    return res.map((user) => {
        return {
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            pref_name: user.pref_name,
            email: user.email || '',
            account_updated: user.account_updated,
            member_since: user.member_since,
        };
    });
}
