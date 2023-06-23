import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { UserI } from '../util/types/user';
import { formatResponse, mysql } from '../util/util';
import { getFacultyIdsAndNames } from './getFaculties';
import { getSpecializationIdsAndNames } from './getSpecializations';
import { getStandingIdsAndNames } from './getStandings';

export const handler = async function (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
    try {
        if (event === null) {
            throw new Error('event not found');
        }

        if (event.body === null) {
            throw new Error('Request body is missing');
        }
        const createdUserId = await CreateUser(
            JSON.parse(event.body) as unknown as UserI
        );

        return formatResponse(200, `user with id : ${createdUserId} created`);
    } catch (error) {
        try {
            return formatResponse(400, (error as Error).message);
        } catch (e) {
            return formatResponse(502, `internal`);
        }
    } finally {
        await mysql.end();
    }
};

export const CreateUser = async (user: UserI): Promise<number> => {
    await validateUserInformation(user);
    const createdUserId = await AddUserToDatabase(user);
    return createdUserId;
};

export const validateUserInformation = async (user: UserI): Promise<void> => {
    const manadatoryFields = [
        'email',
        'firstName',
        'lastName',
        'prefName',
        'facultyId',
        'standingId',
        'specializationId',
    ];

    const missingFields: string[] = [];

    for (const field of manadatoryFields) {
        if (!user[field]) {
            missingFields.push(field);
        }
    }

    if (missingFields.length > 0) {
        throw new Error(`Missing fields: ${missingFields.join(', ')}`);
    }

    await validateEmail(user.email);
    await validateFacultyId(user.facultyId);
    await validateStandingId(user.standingId);
    await validateSpecializationId(user.specializationId);
};

export const validateEmail = async (email: string): Promise<void> => {
    const emailRegex = /\S+@gmail.com/;
    if (!emailRegex.test(email)) {
        throw new Error('email is invalid. Must be a valid gmail address');
    }

    const result = await mysql.query(`SELECT * FROM person WHERE email = ?`, [
        email,
    ]);

    if (result.length > 0) {
        throw new Error('email already exists');
    }
};

export const validateFacultyId = async (facultyId: number): Promise<void> => {
    const refFacultyIds = (await getFacultyIdsAndNames()).map((obj) => obj.id);
    if (!refFacultyIds.includes(facultyId)) {
        throw new Error('faculty is invalid');
    }
};

export const validateStandingId = async (standingId: number): Promise<void> => {
    const refStandingIds = (await getStandingIdsAndNames()).map(
        (obj) => obj.id
    );
    if (!refStandingIds.includes(standingId)) {
        throw new Error('Standing is invalid');
    }
};

export const validateSpecializationId = async (
    specializationId: number
): Promise<void> => {
    const refSpecializationIds = (await getSpecializationIdsAndNames()).map(
        (obj) => obj.id
    );
    if (!refSpecializationIds.includes(specializationId)) {
        throw new Error('Specialization is invalid');
    }
};

export const AddUserToDatabase = async (user: UserI): Promise<number> => {
    const UserInfo = user;

    for (const key in UserInfo) {
        if (UserInfo[key] === undefined) {
            UserInfo[key] = null;
        }
    }

    let createdUserId: number | undefined = undefined;

    await mysql
        .transaction()
        .query(
            'INSERT INTO person (email, first_name, pref_name, last_name, faculty_id, standing_id, specialization_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [
                UserInfo.email,
                UserInfo.firstName,
                UserInfo.prefName,
                UserInfo.lastName,
                UserInfo.facultyId,
                UserInfo.standingId,
                UserInfo.specializationId,
            ]
        )
        .query((result: { insertId: number }) => {
            createdUserId = result.insertId;
            return ['SELECT id from role where role.name = ?', ['Explorer']];
        })
        .query((result: { id: string }) => {
            return [
                'INSERT INTO person_role (user_id, role_id) VALUES (?, ?)',
                [createdUserId, result[0].id],
            ];
        })
        .rollback((e: Error) => {
            console.log(e);
            throw new Error(e.message);
        })
        .commit();

    if (!createdUserId) {
        throw new Error('user not created');
    }
    return createdUserId;
};
