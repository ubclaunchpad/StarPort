import { APIGatewayProxyEvent } from 'aws-lambda';
import { NotFoundError, UnauthorizedError } from './response';
import jwt_decode from 'jwt-decode';
import { GoogleAuthUser } from '../authorization';
import { IHandlerEvent, IMiddleware } from './types';

export class Authorizer implements IMiddleware<IHandlerEvent, object> {
    public handler = async (event: APIGatewayProxyEvent) => {
        const auth = event.headers.Authorization;
        if (auth === undefined) {
            throw new Error('Authorization header is missing');
        }
        const googleAuth = await this.verifyUserIsLoggedIn(auth);
        return { googleAccount: googleAuth };
    };

    verifyUserIsLoggedIn = async (auth: string) => {
        if (!auth) {
            throw new UnauthorizedError('Authorization header is missing');
        }
        const googleAuthUser = jwt_decode(auth) as GoogleAuthUser;

        if (!googleAuthUser.email) {
            throw new NotFoundError('User not found');
        }
        return googleAuthUser;
    };
}
