import { getDatabase } from '../util/db';
import { Authorizer } from '../util/middleware/authorizer';
import { InputValidator } from '../util/middleware/inputValidator';
import { LambdaBuilder, LambdaInput } from '../util/middleware/middleware';
import { APIResponse, SuccessResponse } from '../util/middleware/response';

const db = getDatabase();

export const handler = new LambdaBuilder(router)
    .use(new InputValidator())
    .use(new Authorizer(db))
    .build();

export async function router(event: LambdaInput): Promise<APIResponse> {
    const email = event.googleAccount.email;

    return new SuccessResponse(await getUser(email));
}

export async function getUser(email: string) {
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
            'person.email',
            'person.member_since',
            'person.account_updated',
            'person.first_name',
            'person.pref_name',
            'person.last_name',
            'person.pronouns_id',
            'person.gender_id',
            'person.ethnicity_id',
            'person.faculty_id',
            'person.standing_id',
            'person.specialization_id',
            'person.student_number',
            'person.phone_number',
            'person.linkedin_link',
            'person.github_link',
            'person.website_link',
            'person.resume_link',
            'faculty.label as faculty_label',
            'standing.label as standing_label',
            'specialization.label as specialization_label',
        ])
        .where('person.email', '=', email)
        .executeTakeFirst();

    if (!res) {
        throw new Error('User not found');
    }

    return {
        id: res.id,
        email: res.email,
        member_since: res.member_since,
        account_updated: res.account_updated,
        first_name: res.first_name,
        last_name: res.last_name,
        pref_name: res.pref_name,
        pronouns_id: res.pronouns_id,
        gender_id: res.gender_id,
        ethnicity_id: res.ethnicity_id,
        faculty_id: res.faculty_id,
        standing_id: res.standing_id,
        specialiaztion_id: res.specialization_id,
        student_number: res.student_number,
        phone_number: res.phone_number,
        linkedin_link: res.linkedin_link,
        github_link: res.github_link,
        website_link: res.website_link,
        resume_link: res.resume_link,
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
