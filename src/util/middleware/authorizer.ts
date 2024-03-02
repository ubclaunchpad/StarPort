import { APIGatewayProxyEvent } from 'aws-lambda';
import jwt_decode from 'jwt-decode';
import { Kysely } from 'kysely';
import { GoogleAuthUser } from '../authorization';
import { Database } from '../db';
import { NotFoundError, UnauthorizedError } from './response';
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
            throw new NotFoundError('User not found');
        }
        return googleAuthUser.email == user.email;
    };

    constructor(connection: Kysely<Database>) {
        this.connection = connection;
    }
}


