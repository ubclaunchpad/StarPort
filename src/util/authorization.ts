import jwt_decode from 'jwt-decode';
import { mysql } from './util';
import { UserI } from './types/user';

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

export const verifyUserIsLoggedIn = async (
    auth: string,
    originEmail?: string
) => {
    if (!auth) {
        throw new Error('Authorization is missing');
    }

    const googleAuthUser = jwt_decode(auth) as GoogleAuthUser;

    if (!googleAuthUser.email) {
        throw new Error('Could not verify user is logged in. please try later');
    }

    let email = originEmail;

    if (!email) {
        const result = await mysql.query<UserI[]>(
            'SELECT id, email FROM person WHERE email = ?',
            [googleAuthUser.email]
        );
        if (result.length === 0) {
            throw new Error('User does not exist');
        }

        email = result[0].email;
    }

    if (googleAuthUser.email !== email) {
        throw new Error('User Auth does not match origin email');
    }
};
