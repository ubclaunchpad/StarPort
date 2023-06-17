import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { IIntegrations, UserI } from '../util/types/user';
import { formatResponse, mysql } from '../util/util';
import bcrypt from 'bcryptjs';
import fetch from 'node-fetch';
import {
    FACULTIES,
    PROGRAMS,
    STANDINGS,
    UndisclosedProgramId,
    UnsetRole,
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
    await validateUserInformation(user);
    const createdUserId = await AddUserToDatabase(user);
    await addIntegrations(createdUserId, user.integrations);
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

    const missingFields: string[] = [];

    for (const field of manadatoryFields) {
        if (!user[field]) {
           missingFields.push(field);
        }
    }

    if (missingFields.length > 0) {
        throw new Error(
            `Missing fields: ${missingFields.join(', ')}`
        );
    }

    await validateEmail(user.email);
    validateFacultyId(user.facultyId);
    validateStandingId(user.standingId);

    if (user.programId) {
        validateProgramId(user.programId);
    }
};

export const validateEmail = async (email: string): Promise<void> => {
    const emailRegex = /\S+@gmail.com/;
    if (!emailRegex.test(email)) {
        throw new Error(
            'email is invalid. Must be a valid google email address'
        );
    }

    const result = await mysql.query(`SELECT * FROM person WHERE email = ?`, [email]);
    console.log(result);
    if (result.length > 0) {
        throw new Error('email already exists');
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
            const pId: number = Number(UserInfo.programId) || UndisclosedProgramId;
            return [
                'INSERT INTO person_degree_program (user_id, program_id) VALUES (?, ?)',
                [result.insertId, pId],
            ];
        })
        .query(() => {
            return [
                'INSERT INTO person_role (user_id, role_id) VALUES (?, ?)',
                [createdUserId, UnsetRole],
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

async function addIntegrations(createdUserId, integrations: IIntegrations) {
    if (integrations === undefined) {
        return;
    }
    if (integrations.GithubCode) {
        const githubInfo = await verifyGithub(integrations.GithubCode);
        const hash = await bcrypt.hashSync(githubInfo.access_token, 8);
        console.log(hash);

        await mysql.query(
            'INSERT INTO user_auth (user_id, auth_integration_name, hash_token) VALUES (?, ?, ?)',
            [createdUserId, 'github', hash]
        );
    }
}

async function verifyGithub(githubCode) {
    console.log(githubCode);
    try {
        const response = await fetch(
            'https://github.com/login/oauth/access_token',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'access-control-allow-origin': '*',
                    'referrer-policy': 'no-referrer',
                },
                body: JSON.stringify({
                    client_id: 'Iv1.bfff0a578d157ec8',
                    client_secret: '636f28fd21527eed08d50c801777aeb8a2c7d7cf',
                    code: githubCode,
                }),
            }
        );
        const data = await response.json();
        console.log(data);
        return data;
    } catch (error) {
        console.log('error', error);
    }
}
