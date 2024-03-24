import { Authorizer } from '../util/middleware/authorizer';
import { InputValidator } from '../util/middleware/inputValidator';
import { PersonTable, getDatabase } from '../util/db';
import { IPersonQuery } from '../util/types/general';
import { LambdaBuilder, LambdaInput } from '../util/middleware/middleware';
import {
    PaginationHelper,
    ResponseMetaTagger,
} from '../util/middleware/paginationHelper';
import { APIResponse, SuccessResponse } from '../util/middleware/response';
import {
    ACCESS_SCOPES,
    ScopeController,
} from '../util/middleware/scopeHandler';

const db = getDatabase();
const validScopes = [
    ACCESS_SCOPES.ADMIN_READ,
    ACCESS_SCOPES.READ_ALL_PROFILE_DATA,
];

const DEFAULT_LIMIT = 50;
const DEFAULT_OFFSET = 0;

export const handler = new LambdaBuilder(getUserRequest)
    .use(new InputValidator())
    .use(new Authorizer(db))
    .use(new ScopeController(db))
    .use(new PaginationHelper({ limit: DEFAULT_LIMIT, offset: DEFAULT_OFFSET}))
    .useAfter(new ResponseMetaTagger())
    .build();

export async function getUserRequest(event: LambdaInput): Promise<APIResponse> {
    ScopeController.verifyScopes(event.userScopes, validScopes);

  
    if (event.pagination) {
        const count = await countUsers();
        event.pagination.count = count;
    }

    const personQuery = ((event && event.pagination) ||
        {}) as unknown as IPersonQuery;        

    if (event.queryStringParameters && event.queryStringParameters.search) {
        personQuery.search = event.queryStringParameters.search;
    }
    
    if (event.queryStringParameters && event.queryStringParameters.filter) {
        personQuery.filter = JSON.parse(event.queryStringParameters.filter);
    }

    return new SuccessResponse(await getAll(personQuery));
}

export async function getAll(personQuery: IPersonQuery) {
    let query = db.selectFrom('person').select([
        'person.id',
        'person.first_name',
        'person.last_name',
        'person.pref_name',
        'person.person_role_id',
        'person.email',
        'person.account_updated',
        'person.member_since'
    ]);

    // Apply limit and offset
    query = query.limit(personQuery.limit || DEFAULT_LIMIT).offset(personQuery.offset || DEFAULT_OFFSET);

    // Apply search if provided
    if (personQuery.search) {
        query = query.where(`person.first_name`, 'like', `%${personQuery.search.toLowerCase()}%`);
        //WIP use full name or more values to search (it works rn with just first name tho!)
        
    }

    // (For filtering functionality use the queryUsers POST endpoint)

    const res = await query.execute();

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

async function countUsers() {
    const ret = await db.selectFrom('person')
    .select(({ fn }) => [
      fn.count<number>('id').as('count'),
    ])
    .executeTakeFirst();
    if (!ret) {
      throw new Error('Unable to count users');
    }
    return Number(ret.count);
}
