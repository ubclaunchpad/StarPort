import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { UserUpdateI } from '../util/types/user';
import { formatResponse, connectToDb, DATABASE_CONFIG } from '../util/util';

const mysql = connectToDb(DATABASE_CONFIG.getDBConfig());

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

        if (
            event.pathParameters === null ||
            event.pathParameters.userId === null
        ) {
            throw new Error('User Id is missing');
        }

        const resp = await updateUser(
            event.pathParameters.userId as string,
            event.body as UserUpdateI
        );
        mysql.end();
        return formatResponse(200, resp);
    } catch (error) {
        return formatResponse(200, { message: (error as any).message });
    }
};

export const updateUser = async (
    userId: string,
    userInfo: UserUpdateI
): Promise<void> => {
    const {
        email,
        firstName,
        prefName,
        lastName,
        resumeLink,
        facultyId,
        standingId,
    } = userInfo;
    // TODO: update it to make it robust
    let query = 'UPDATE person SET ';
    const values = [];
    if (email) {
        query += 'email = ?, ';
        values.push(email);
    }
    if (firstName) {
        query += 'first_name = ?, ';
        values.push(firstName);
    }
    if (prefName) {
        query += 'pref_name = ?, ';
        values.push(prefName);
    }
    if (lastName) {
        query += 'last_name = ?, ';
        values.push(lastName);
    }
    if (resumeLink) {
        query += 'resumelink = ?, ';
        values.push(resumeLink);
    }
    if (facultyId) {
        query += 'faculty_id = ?, ';
        values.push(facultyId);
    }
    if (standingId) {
        query += 'standing_id = ?, ';
        values.push(standingId);
    }
    query += ' WHERE id = ?';
    values.push(userId);
    mysql.query(query, values);
};
