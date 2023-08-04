import { getDatabase } from '../util/db';
import { LambdaBuilder } from '../util/middleware/middleware';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { APIResponse, SuccessResponse } from '../util/middleware/response';
import { Authorizer } from '../util/middleware/authorizer';
import { InputValidator } from '../util/middleware/inputValidator';

const db = getDatabase();

export const handler = new LambdaBuilder(router)
    .use(new InputValidator())
    .use(new Authorizer())
    .build();

export async function router(
    event: APIGatewayProxyEvent
): Promise<APIResponse> {
    const id = event.pathParameters.id;
    return new SuccessResponse(await getUser(id));
}

export async function getUser(userId: string) {
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
            'person.first_name',
            'person.created_at',
            'person.updated_at',
            'person.resume_link',
            'person.member_since',
            'person.username',
            'person.email',
            'person.faculty_id',
            'person.standing_id',
            'person.specialization_id',
            'faculty.label as faculty_label',
            'standing.label as standing_label',
            'specialization.label as specialization_label',
        ])
        .where('person.id', '=', userId)
        .executeTakeFirst();

    if (!res) {
        throw new Error('User not found');
    }

    return {
        id: res.id,
        first_name: res.first_name,
        last_name: res.last_name,
        pref_name: res.pref_name,
        email: res.email,
        created_at: res.created_at,
        updated_at: res.updated_at,
        resume_link: res.resume_link,
        member_since: res.member_since,
        username: res.username,
        faculty: {
            id: res.faculty_id,
            label: res.faculty_label,
        },
        standing: {
            id: res.standing_id,
            label: res.standing_label,
        },
        specialization: {
            id: res.specialization_id,
            label: res.specialization_label,
        },
    };
}
