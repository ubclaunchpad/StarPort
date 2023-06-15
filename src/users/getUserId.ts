import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import jwt_decode from 'jwt-decode';
import { formatResponse, mysql } from '../util/util';

export interface GoogleAuthUser {
    aud: string;
    azp: string;
    email: string;
    email_verified: boolean;
    exp: number;
    family_name: string;
    given_name: string;
    iat: number;
    iss: string;
    jti: string;
    name: string;
    nbf: number;
    picture: string;
    sub: string;
    token?: string;
}

export const handler = async function (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
    try {
        if (event === null) {
            throw new Error('event not found');
        }

        const auth = event.headers.Authorization;

        if (auth === undefined) {
            throw new Error('Authorization header is missing');
        }
        const googleAuthUser = jwt_decode(auth) as GoogleAuthUser;
        const resp = await getUser(googleAuthUser.email);
        mysql.end();
        // calc api response time
        return formatResponse(200, resp);
    } catch (error) {
        return formatResponse(200, { message: (error as Error).message });
    }
};

export async function getUser(userEmail: string) {
    const result = await mysql.query(
        `SELECT
    p.user_id AS userId,
    p.email,
    p.first_name AS firstName,
    p.pref_name AS prefName,
    p.last_name AS lastName,
    p.standing_id AS standing,
    p.faculty_id AS faculty
    FROM
    person p
    WHERE p.email = ?`,
        [userEmail]
    );
    const users = result as any[];
    if (users.length === 0) {
        throw new Error('User not found');
    }
    const user = users[0];
    return user;
}
