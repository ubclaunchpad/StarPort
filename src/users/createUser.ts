import { APIGatewayProxyEvent } from 'aws-lambda';
import {getDatabaseParser, NewPerson, Person, queryDatabaseAPI} from '../util/db';
import { LambdaBuilder } from '../util/middleware/middleware';
import { InputValidator } from '../util/middleware/inputValidator';
import { Authorizer } from '../util/middleware/authorizer';
import {
    APIResponse,
    BadRequestError,
    SuccessResponse,
} from '../util/middleware/response';

const db = getDatabaseParser();

export const handler = new LambdaBuilder(router)
    .use(new InputValidator())
    .use(new Authorizer())
    .build();

export async function router(
    event: APIGatewayProxyEvent
): Promise<APIResponse> {
    const body = JSON.parse(event.body) as Person;
    const createdUserId = await CreateUser(body);
    return new SuccessResponse({
        message: `user with id : ${createdUserId} created`,
    });
}

export const CreateUser = async (person: Person): Promise<string> => {
    await validateUserInformation(person);
    return await AddUserToDatabase(person);
};

export const validateUserInformation = async (
    person: Person
): Promise<void> => {
    const mandatoryFields = [
        'email',
        'first_name',
        'last_name',
        'pref_name',
        'faculty_id',
        'standing_id',
        'specialization_id',
    ];

    const missingFields: string[] = [];
    for (const field of mandatoryFields) {
        if (!person[field]) {
            missingFields.push(field);
        }
    }

    if (missingFields.length > 0) {
        throw new BadRequestError(
            `Missing fields: ${missingFields.join(', ')}`
        );
    }
    await validateEmail(person.email);
    await validateFacultyId(person.faculty_id);
    await validateStandingId(person.standing_id);
    await validateSpecializationId(person.specialization_id);
};

export const validateEmail = async (email: string): Promise<void> => {
    // const emailRegex = /\S+@gmail.com/;
    // if (!emailRegex.test(email)) {
    //     throw new BadRequestError(
    //         'email is invalid. Must be a valid gmail address'
    //     );
    // }
    const query = await db
        .selectFrom('person')
        .select(['email'])
        .where('email', '=', email)
        .compile();

    const person = (await queryDatabaseAPI(query)).rows[0];

    if (person) {
        throw new BadRequestError('email already exists');
    }
};

export const validateFacultyId = async (facultyId: string): Promise<void> => {
    const faculty = await db
        .selectFrom('faculty')
        .select(['id'])
        .where('id', '=', facultyId)
        .executeTakeFirst();
    if (!faculty) {
        throw new BadRequestError('Faculty is invalid');
    }
};

export const validateStandingId = async (standingId: string): Promise<void> => {
    const standing = await db
        .selectFrom('standing')
        .select(['id'])
        .where('id', '=', standingId)
        .executeTakeFirst();
    if (!standing) {
        throw new BadRequestError('Standing is invalid');
    }
};

export const validateSpecializationId = async (
    specializationId: string
): Promise<void> => {
    const specialization = await db
        .selectFrom('specialization')
        .select(['id'])
        .where('id', '=', specializationId)
        .executeTakeFirst();
    if (!specialization) {
        throw new BadRequestError('Specialization is invalid');
    }
};

export const AddUserToDatabase = async (user: NewPerson): Promise<string> => {
    const UserInfo = user;
    for (const key in UserInfo) {
        if (UserInfo[key] === undefined) {
            UserInfo[key] = null;
        }
    }
    if (!user.username) {
        user.username = user.email;
    }

    const person = await db
        .insertInto('person')
        .values(user)
        .returning('id')
        .executeTakeFirst();
    return person.id;
};
