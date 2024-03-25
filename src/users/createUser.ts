import { getDatabase, NewPerson, Person } from '../util/db';
import { InputValidator } from '../util/middleware/inputValidator';
import { LambdaBuilder, LambdaInput } from '../util/middleware/middleware';
import {
    APIResponse,
    BadRequestError,
    SuccessResponse,
} from '../util/middleware/response';
import {
    ACCESS_SCOPES,
    ScopeController,
} from '../util/middleware/scopeHandler';

const db = getDatabase();
const validScopes = [ACCESS_SCOPES.ADMIN_WRITE, ACCESS_SCOPES.WRITE_PROFILE];

export const handler = new LambdaBuilder(router)
    .use(new InputValidator())
    .build();

export async function router(event: LambdaInput): Promise<APIResponse> {
    if (!event.body) {
        throw new BadRequestError('Event body missing');
    }

    const body = JSON.parse(event.body) as Person;

    const createdUserId = await CreateUser(body);

    return new SuccessResponse({
        message: `user with id: ${createdUserId} created`,
    });
}

export const CreateUser = async (person: Person): Promise<string> => {
    await validateUserInformation(person);
    return await addUserToDatabase(person);
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
    const person = await db
        .selectFrom('person')
        .select(['email'])
        .where('email', '=', email)
        .executeTakeFirst();

    if (person) {
        throw new BadRequestError('email already exists');
    }
};

export const validateFacultyId = async (facultyId: number): Promise<void> => {
    const faculty = await db
        .selectFrom('faculty')
        .select(['id'])
        .where('id', '=', facultyId)
        .executeTakeFirst();
    if (!faculty) {
        throw new BadRequestError('Faculty is invalid');
    }
};

export const validateStandingId = async (standingId: number): Promise<void> => {
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
    specializationId: number
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

export const addUserToDatabase = async (user: NewPerson): Promise<string> => {
    const UserInfo = user;
    for (const key in UserInfo) {
        if (UserInfo[key] === undefined) {
            UserInfo[key] = null;
        }
    }

    const person = await db
        .insertInto('person')
        .values(user)
        .executeTakeFirst();

    if (!person.insertId) {
        throw new BadRequestError('Could not find created user id');
    }

    addUserDefaultRole(Number(person.insertId));

    return person.insertId.toString();
};

export const addUserDefaultRole = async (userId: number): Promise<void> => {
    const roles = await db
        .selectFrom('role')
        .select(['id', 'label'])
        .where('label', 'like', 'Member')
        .execute();

    if (roles.length === 0) {
        throw new BadRequestError('Role not found');
    }

    for (const role of roles) {
        await db
            .insertInto('person_role')
            .values({ person_id: userId, role_id: role.id })
            .execute();
    }
};
