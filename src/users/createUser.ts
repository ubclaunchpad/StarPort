import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { UserI } from '../util/types/user';
import { formatResponse, mysql } from '../util/util';

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
        const createdUserId = await addUser(
            JSON.parse(event.body) as unknown as UserI
        );
        mysql.end();
        return formatResponse(200, `user with id : ${createdUserId} created`);
    } catch (error) {
        return formatResponse(200, { message: (error as Error).message });
    }
};

export const addUser = async (user: UserI): Promise<string> => {
    const {
        email,
        firstName,
        prefName,
        lastName,
        resumeLink,
        facultyId,
        standingId,
        programId,
    } = user;
    let createdUserId = '';
    await mysql
        .transaction()
        .query(
            'INSERT INTO person (email, first_name, pref_name, last_name, resumelink, faculty_id, standing_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [
                email,
                firstName,
                prefName,
                lastName,
                resumeLink,
                facultyId,
                standingId,
            ]
        )
        .query((r: any) => {
            createdUserId = r.insertId;
            // TODO: add 76 undisclosed program id
            const pId = programId || 76;
            return [
                'INSERT INTO person_degree_program (user_id, program_id) VALUES (?, ?)',
                [r.insertId, pId],
            ];
        })
        .rollback((e: Error) => {
            throw new Error(e.message);
        })
        .commit()
        .finally(() => {
            mysql.end();
        });

    return createdUserId;
};
