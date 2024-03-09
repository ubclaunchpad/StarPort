import { APIGatewayProxyEvent } from 'aws-lambda';
import { NotFoundError, UnauthorizedError } from './response';
import jwt_decode from 'jwt-decode';
import { GoogleAuthUser } from '../authorization';
import { IHandlerEvent, IMiddleware } from './types';
import { Kysely } from 'kysely';
import {Database} from "../db";


type AuthorizerParams = {
    shouldGetUser: boolean;
};
export class Authorizer implements IMiddleware<IHandlerEvent, object> {
    private connection: Kysely<Database>;
    private params: AuthorizerParams;

    public handler = async (event: APIGatewayProxyEvent) => {
        const auth = event.headers.Authorization;
        if (auth === undefined) {
            throw new UnauthorizedError('Authorization header is missing');
        }
        const googleAuth = await this.verifyUserIsLoggedIn(auth);

        console.log(googleAuth);
        console.log("gwe");

        return { googleAccount: googleAuth};
    };

    verifyUserIsLoggedIn = async (auth: string) => {
        const googleAuthUser = jwt_decode(auth) as GoogleAuthUser;

        if (!googleAuthUser.email) {
            throw new NotFoundError('User not found');
        }

        console.log(googleAuthUser.email);
        const user = await this.connection.selectFrom('person').where('email','=', googleAuthUser.email).selectAll().executeTakeFirst();

        console.log("user");
        if (!user) {
            throw new NotFoundError('User not found');
        }

        return user;
    };


    constructor(connection: Kysely<Database>, params = { shouldGetUser: false}) {
        this.params = params;
        this.connection = connection;
    }
}
