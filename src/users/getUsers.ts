import { Authorizer } from '../util/middleware/authorizer';
import { InputValidator } from '../util/middleware/inputValidator';
import { getDatabaseParser, queryDatabaseAPI } from '../util/db';
import { IPersonQuery } from '../util/types/general';
import { LambdaBuilder, LambdaInput } from '../util/middleware/middleware';
import { APIResponse, SuccessResponse } from '../util/middleware/response';
import {ScopeController} from "../util/middleware/scopeHandler";

const db = getDatabaseParser();

export const handler = new LambdaBuilder(getRequest)
    .use(new InputValidator())
    .use(new Authorizer())
    .use(new ScopeController())
    .build();

export async function getRequest(event: LambdaInput): Promise<APIResponse> {
    const personQuery = ((event && event.queryStringParameters) ||
        {}) as unknown as IPersonQuery;
    return new SuccessResponse(await getAll(personQuery, event.userScopes));
}

export async function getAll(personQuery: IPersonQuery, userScopes: string[]) {
    const hasReadScope = userScopes && userScopes.includes('profile:read:others');

    const query = await db
        .selectFrom('person')
        .innerJoin('faculty', 'person.faculty_id', 'faculty.id')
        .innerJoin('standing', 'person.standing_id', 'standing.id')
        .innerJoin(
            'specialization',
            'person.specialization_id',
            'specialization.id'
        )
        .select([
            'person.last_name',
            'person.id',
            'person.pref_name',
            'person.faculty_id',
            'person.standing_id',
            'person.specialization_id',
            'faculty.label as faculty_label',
            'standing.label as standing_label',
            'specialization.label as specialization_label',
        ])
        .$if(hasReadScope, (qb) => qb.select('person.email'))
        .limit(personQuery.limit || 10)
        .offset(personQuery.offset || 0)
        .compile();

    const res = (await queryDatabaseAPI(query)).rows;

    return res.map((user) => {
        return {
            id: user.id,
            last_name: user.last_name,
            pref_name: user.pref_name,
            email: user.email,
            faculty: {
                id: user.faculty_id,
                label: user.faculty_label,
            },
            standing: {
                id: user.standing_id,
                label: user.standing_label,
            },
            specialization: {
                id: user.specialization_id,
                label: user.specialization_label,
            },
        };
    });
}
