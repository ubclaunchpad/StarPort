import { APIGatewayProxyEvent } from 'aws-lambda';
import { NotFoundError, UnauthorizedError } from './response';
import jwt_decode from 'jwt-decode';
import { GoogleAuthUser } from '../authorization';
import { IHandlerEvent, IMiddleware } from './types';
import { Database } from '../db';
import { Kysely } from 'kysely';


type AuthorizerParams = {
    db?: Kysely<Database>;
    shouldGetUser: boolean;
};


export class Authorizer implements IMiddleware<IHandlerEvent, object> {
    private params: AuthorizerParams = {
        shouldGetUser: false,
    };

    constructor(params?: AuthorizerParams) {
        if (params) {
            this.params = params;
        }
     }


    public handler = async (event: APIGatewayProxyEvent) => {
        const auth = event.headers.Authorization;
        if (auth === undefined) {
            throw new UnauthorizedError('Authorization header is missing');
        }
        const googleAuth = await this.verifyUserIsLoggedIn(auth);

        if (this.params.shouldGetUser && this.params.db) {
            return this.getUser(googleAuth, this.params.db);
        }

        return { googleAccount: googleAuth};
    };

    verifyUserIsLoggedIn = async (auth: string) => {
        const googleAuthUser = jwt_decode(auth) as GoogleAuthUser;

        if (!googleAuthUser.email) {
            throw new NotFoundError('User not found');
        }
        return googleAuthUser;
    };

    getUser = async (googleAuth: GoogleAuthUser, db: Kysely<Database>) => {
        const user = await db
            .selectFrom('person')
            .where('email', '=', googleAuth.email)
            .selectAll()
            .executeTakeFirst();

        if (!user) {
            throw new NotFoundError('User not found');
        }
        return { user, googleAccount: googleAuth };
    };
}
