import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { mysql, formatResponse } from '../util/util';
import { IUserQuery } from '../util/types/user';

export const handler = async function (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
    try {
        const params = (event && event.queryStringParameters) || {};
        const resp = await getAll(params as IUserQuery);
        mysql.end();
        return formatResponse(200, resp);
    } catch (error) {
        return formatResponse(200, { message: (error as Error).message });
    }
};

export async function getAll(userQuery: IUserQuery) {
    let query = `SELECT 
    p.user_id AS userId,
    p.email,
    p.first_name AS firstName,
    p.pref_name AS prefName,
    p.last_name AS lastName,
    p.resumelink AS resumeLink,
    p.standing_id as standing,
    p.faculty_id as faculty
    FROM person p
    WHERE 1=1 `;

    if (userQuery.fn) {
        query += ` AND p.first_name LIKE '%${userQuery.fn}%'`;
    }

    if (userQuery.pn) {
        query += ` AND p.pref_name LIKE '%${userQuery.pn}%'`;
    }

    if (userQuery.ln) {
        query += ` AND p.last_name LIKE '%${userQuery.ln}%'`;
    }

    if (userQuery.fid) {
        query += ` AND f.faculty_id = ${userQuery.fid}`;
    }

    if (userQuery.email) {
        query += ` AND p.email LIKE '%${userQuery.email}%'`;
    }

    if (userQuery.sid) {
        query += ` AND s.standing_id LIKE '%${userQuery.sid}%'`;
    }

    if (userQuery.pid) {
        query += ` AND pdp.program_id = ${userQuery.pid}`;
    }

    if (userQuery.limit && userQuery.offset) {
        query += ` LIMIT ${userQuery.limit} OFFSET ${userQuery.offset}`;
    } else {
        query += ` LIMIT 20 OFFSET 0`;
    }

    const result = await mysql.query(query);
    if (result === null) {
        throw new Error('User not found');
    }

    return result;
}
