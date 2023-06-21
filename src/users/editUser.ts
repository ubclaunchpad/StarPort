import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { UserUpdateI } from '../util/types/user';
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

        if (
            event.pathParameters === null ||
            event.pathParameters.id === null
        ) {
            throw new Error('User Id is missing');
        }

        const resp = await updateUser(
            event.pathParameters.id as string,
            JSON.parse(event.body) as UserUpdateI
        );
        return formatResponse(200, resp);
    } catch (error) {
        return formatResponse(400, { message: (error as Error).message });
    } finally {
        mysql.end();
    }
};

export const updateUser = async (
    userId: string,
    userInfo: UserUpdateI
): Promise<void> => {
    const {
        firstName,
        prefName,
        lastName,
        resumeLink,
        facultyId,
        standingId,
        specializationId
    } = userInfo;

    const values = [];
    const columns = [];

    if (firstName) {
        columns.push('first_name = ?');
        values.push(firstName);
    }
    if (prefName) {
        columns.push('pref_name = ?');
        values.push(prefName);
    }
    if (lastName) {
        columns.push('last_name = ?');
        values.push(lastName);
    }
    if (resumeLink) {
        columns.push('resume_link = ?');
        values.push(resumeLink);
    }
    if (facultyId) {
        columns.push('faculty_id = ?');
        values.push(facultyId);
    }
    if (standingId) {
        columns.push('standing_id = ?');
        values.push(standingId);
    }

    if (specializationId) {
        columns.push('specialization_id = ?');
        values.push(specializationId);
    }

    const updateQuery = `UPDATE person SET ${columns.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    values.push(userId);
    await mysql.query(updateQuery, values);
};
