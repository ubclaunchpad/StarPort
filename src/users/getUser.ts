import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { formatResponse, mysql } from '../util/util';
import { IUserQueryResult, IUserInfo } from '../util/types/user';

export const handler = async function (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
    try {
        if (event === null) {
            throw new Error('event not found');
        }

        if (event.pathParameters === null || event.pathParameters.id === null) {
            throw new Error('User Id is missing');
        }

        const resp = await getUser(Number(event.pathParameters.id));
        return formatResponse(200, resp);
    } catch (error) {
        return formatResponse(400, { message: (error as Error).message });
    } finally {
        mysql.end();
    }
};

export async function getUser(userId: number) {
    const result = await mysql.query<IUserQueryResult[]>(
        ` SELECT 
        p.id AS id,
        p.username AS username,
        p.email,
        p.first_name AS firstName,
        p.pref_name AS prefName,
        p.last_name AS lastName,
        p.resumelink AS resumeLink,
        f.id as faculty_id,
        f.name as faculty_name,
        st.id as standing_id,
        st.name as standing_name,
        sp.id as specialization_id,
        sp.name as specialization_name,
        p.created_at AS createdAt,
        p.updated_at AS updatedAt,
        p.member_since AS memberSince
        FROM person p
        INNER JOIN person_role r ON r.user_id = p.id
        INNER JOIN role role ON role.id = r.role_id 
        INNER JOIN faculty f ON f.id = p.faculty_id
        INNER JOIN specialization sp ON sp.id = p.specialization_id
        INNER JOIN standing st ON st.id = p.standing_id
        WHERE p.id = ?`,
        [userId]
    );

    if (result.length === 0) {
        throw new Error('User not found');
    }

    const userResult = result[0];

    const user: Partial<IUserInfo> = {...userResult};

    user.faculty = { id: userResult.faculty_id, name: userResult.faculty_name };
    user.standing = {
        id: userResult.standing_id,
        name: userResult.standing_name,
    };
    user.specialization = {
        id: userResult.specialization_id,
        name: userResult.specialization_name,
    };

    user.roles = await mysql.query(
        `SELECT role.id, role.name FROM role INNER JOIN person_role pr ON pr.role_id = role.id WHERE pr.user_id = ?`,
        [userId]
    );

    const fields = [
        'id',
        'username',
        'firstName',
        'lastName',
        'prefName',
        'resumeLink',
        'faculty',
        'standing',
        'specialization',
        'roles',
        'email',
        'username',
        'createdAt',
        'updatedAt',
        'memberSince',
    ];
    return Object.fromEntries(
        Object.entries(user).filter(([key]) => fields.includes(key))
    );
}
