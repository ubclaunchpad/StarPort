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
        return formatResponse(200, resp);
    } catch (error) {
        return formatResponse(400, { message: (error as Error).message });
    } finally {
        mysql.end();
    }
};

export async function getUser(userEmail: string) {
    const result = await mysql.query(
        `SELECT
    p.id AS id,
    p.email
    FROM 
    person p
    WHERE p.email = ?`,
        [userEmail]
    );
    const users = result as any[];
    if (users.length === 0) {
        throw new Error('User not found');
    }
    return users[0];
}
