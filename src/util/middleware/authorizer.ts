import { APIGatewayProxyEvent } from 'aws-lambda';
import jwt_decode from 'jwt-decode';
import { Kysely } from 'kysely';
import { GoogleAuthUser } from '../authorization';
import { Database } from '../db';
import { NotFoundError, UnauthorizedError } from './response';
import { ScopeController } from './scopeHandler';
import { IHandlerEvent, IMiddleware } from './types';

export class Authorizer implements IMiddleware<IHandlerEvent, object> {
    private connection: Kysely<Database>;

    public handler = async (event: APIGatewayProxyEvent) => {
        const auth = event.headers.Authorization;
        if (auth === undefined) {
            throw new UnauthorizedError('Authorization header is missing');
        }
        const googleAuth = await this.verifyUserIsLoggedIn(auth);

        return { googleAccount: googleAuth };
    };

    verifyUserIsLoggedIn = async (auth: string) => {
        const googleAuthUser = jwt_decode(auth) as GoogleAuthUser;

        if (!googleAuthUser.email) {
            throw new NotFoundError('User not found');
        }

        const user = await this.connection
            .selectFrom('person')
            .select(['email'])
            .where('person.email', '=', googleAuthUser.email)
            .executeTakeFirst();

        if (!user) {
            throw new NotFoundError('Authorized user not found');
        }

        return googleAuthUser;
    };

    public static verifyCurrentUser = async (
        connection: Kysely<Database>,
        id: number,
        googleAuthUser: GoogleAuthUser
    ) => {
        const user = await connection
            .selectFrom('person')
            .select(['email'])
            .where('person.id', '=', id)
            .executeTakeFirst();

        if (!user) {
            return false;
        }
        console.log(user);
        console.log(googleAuthUser);
        return googleAuthUser.email == user.email;
    };

    public static authorizeOrVerifyScopes = async (
        db: Kysely<Database>,
        userId: number,
        userScopes: string[],
        personalScope: string,
        validScopes: string[],
        googleUser: GoogleAuthUser
    ) => {
        const canAccessOwnProfile = userScopes.includes(personalScope);
        const isCurrentUser = await Authorizer.verifyCurrentUser(
            db,
            userId,
            googleUser
        );
        console.log(`currentuser: ${isCurrentUser}`);
        if (canAccessOwnProfile && isCurrentUser) {
            console.log('User is authorized');
            return;
        }
        ScopeController.verifyScopes(userScopes, validScopes);
    };

    constructor(connection: Kysely<Database>) {
        this.connection = connection;
    }
}
