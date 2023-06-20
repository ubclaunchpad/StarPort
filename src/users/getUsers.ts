import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { mysql, formatResponse } from '../util/util';
import { IUserQuery } from '../util/types/user';

export const handler = async function (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
    try {
        const params = (event && event.queryStringParameters) || {};
        const resp = await getAll(params as IUserQuery);
        return formatResponse(200, resp);
    } catch (error) {
        return formatResponse(400, { message: (error as Error).message });
    } finally {
        mysql.end();
    }
};

export async function getAll(userQuery: IUserQuery) {
    let query = `
    SELECT 
        p.id AS id,
        p.username AS username,
        p.email,
        p.first_name AS firstName,
        p.pref_name AS prefName,
        p.last_name AS lastName,
        p.resumelink AS resumeLink,
        JSON_OBJECT("id", f.id, 'name', f.name) AS faculty,
        JSON_OBJECT("id", st.id, "name", st.name) AS standing,
        JSON_OBJECT("id", sp.id, "name", sp.name) AS specialization,
        JSON_ARRAY(JSON_OBJECT("id", role.id, "name", role.name)) AS roles,
        p.created_at AS createdAt,
        p.updated_at AS updatedAt,
        p.member_since AS memberSince
        FROM person p
        INNER JOIN person_role r ON r.user_id = p.id
        INNER JOIN role role ON role.id = r.role_id 
        INNER JOIN faculty f ON f.id = p.faculty_id
        INNER JOIN specialization sp ON sp.id = p.specialization_id
        INNER JOIN standing st ON st.id = p.standing_id
        WHERE 1=1 `;

    if (userQuery.limit && userQuery.offset) {
        query += ` LIMIT ${userQuery.limit} OFFSET ${userQuery.offset}`;
    } else {
        query += ` LIMIT 20 OFFSET 0`;
    }

    const result = await mysql.query(query);
    if (result === null) {
        throw new Error('No user found');
    }
    return  result;
}
