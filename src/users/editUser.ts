import { APIGatewayProxyEvent } from 'aws-lambda';
import { LambdaBuilder } from '../util/middleware/middleware';
import { InputValidator } from '../util/middleware/inputValidator';
import { Authorizer } from '../util/middleware/authorizer';
import {
    SuccessResponse,
    UnsupportedEndpointError,
} from '../util/middleware/response';
// const db = getDatabase();

export const handler = new LambdaBuilder(router)
    .use(new InputValidator())
    .use(new Authorizer())
    .build();

export async function router(event: APIGatewayProxyEvent): Promise<any> {
    await updateUser();
    // event.pathParameters.id as string,
    // JSON.parse(event.body) as UserUpdateI
    return new SuccessResponse({
        message: `user with id : ${event.pathParameters.id} updated`,
    });
}

export const updateUser = async (): // userId: string,
// userInfo: UserUpdateI
Promise<void> => {
    throw new UnsupportedEndpointError('Not implemented yet');
};
