import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { UserI } from '../util/types/user';
import { formatResponse, mysql } from '../util/util';
import {
    FACULTIES,
    PROGRAMS,
    STANDINGS,
    UndisclosedProgramId,
} from '../constants/userConstants';

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
        mysql.end();
        return formatResponse(200, `user with id : ${createdUserId} created`);
    } catch (error) {
        return formatResponse(400, { message: (error as Error).message });
    }
};

export const CreateUser = async (user: UserI): Promise<number> => {
    validateUserInformation(user);
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
    ];

    for (const field of manadatoryFields) {
        if (!user[field]) {
            throw new Error(`${field} is missing`);
        }
    }

    validateEmail(user.email);
    validateFacultyId(user.facultyId);
    validateStandingId(user.standingId);

    if (user.programId) {
        validateProgramId(user.programId);
    }
};

export const validateEmail = (email: string): void => {
    const emailRegex = /\S+@gmail.com/;
    if (!emailRegex.test(email)) {
        throw new Error(
            'email is invalid. Must be a valid google email address'
        );
    }
};

export const validateFacultyId = (facultyId: number): void => {
    const refFacultyIds = Object.keys(FACULTIES).map((key) => Number(key));
    if (!refFacultyIds.includes(facultyId)) {
        throw new Error('facultyId is invalid');
    }
};

export const validateStandingId = (standingId: number): void => {
    const refStandingIds = Object.keys(STANDINGS).map((key) => Number(key));
    if (!refStandingIds.includes(standingId)) {
        throw new Error('StandingId is invalid');
    }
};

export const validateProgramId = (programId: number): void => {
    const refProgramIds = Object.keys(PROGRAMS).map((key) => Number(key));
    if (!refProgramIds.includes(programId)) {
        throw new Error('ProgramId is invalid');
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
            'INSERT INTO person (email, first_name, pref_name, last_name, resumelink, faculty_id, standing_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [
                UserInfo.email,
                UserInfo.firstName,
                UserInfo.prefName,
                UserInfo.lastName,
                UserInfo.resumeLink,
                UserInfo.facultyId,
                UserInfo.standingId,
            ]
        )
        .query((result: { insertId: number }) => {
            createdUserId = result.insertId;
            const pId = UserInfo.programId || UndisclosedProgramId;
            return [
                'INSERT INTO person_degree_program (user_id, program_id) VALUES (?, ?)',
                [result.insertId, pId],
            ];
        })
        .rollback((e: Error) => {
            throw new Error(e.message);
        })
        .commit()
        .finally(() => {
            mysql.end();
        });

    if (!createdUserId) {
        throw new Error('user not created');
    }
    return createdUserId;
};
