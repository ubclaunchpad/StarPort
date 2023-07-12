import { APIGatewayProxyEvent } from 'aws-lambda';
import { Authorizer } from '../util/middleware/authorizer';
import { InputValidator } from '../util/middleware/inputValidator';
import { getDatabase } from '../util/db';
import { IPersonQuery } from '../util/types/general';
import { LambdaBuilder } from '../util/middleware/middleware';
import { APIResponse, SuccessResponse } from '../util/middleware/response';

const db = getDatabase();

export const handler = new LambdaBuilder(getRequest)
    .use(new InputValidator())
    .use(new Authorizer())
    .build();

export async function getRequest(
    event: APIGatewayProxyEvent
): Promise<APIResponse> {
    const personQuery = ((event && event.queryStringParameters) ||
        {}) as unknown as IPersonQuery;
    return new SuccessResponse(await getAll(personQuery));
}

export async function getAll(personQuery: IPersonQuery) {
    const res = await db
        .selectFrom('person')
        .innerJoin('faculty', 'person.faculty_id', 'faculty.id')
        .innerJoin('standing', 'person.standing_id', 'standing.id')
        .innerJoin(
            'specialization',
            'person.specialization_id',
            'specialization.id'
        )
        .select([
            'person.id',
            'person.last_name',
            'person.pref_name',
            'person.email',
            'person.faculty_id',
            'person.standing_id',
            'person.specialization_id',
            'faculty.label as faculty_label',
            'standing.label as standing_label',
            'specialization.label as specialization_label',
        ])
        .limit(personQuery.limit || 10)
        .offset(personQuery.offset || 0)
        .execute();

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
