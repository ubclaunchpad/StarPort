import { APIGatewayProxyEvent } from 'aws-lambda';
import {getDatabaseParser, queryDatabaseAPI} from '../util/db';
import { LambdaBuilder } from '../util/middleware/middleware';
import { APIResponse, SuccessResponse } from '../util/middleware/response';
import { InputValidator } from '../util/middleware/inputValidator';
import { Authorizer } from '../util/middleware/authorizer';

const db = getDatabaseParser();

export const handler = new LambdaBuilder(router)
    .use(new InputValidator())
    .use(new Authorizer())
    .build();

export async function router(
    event: APIGatewayProxyEvent
): Promise<APIResponse> {
    await deleteUser(event.pathParameters.id as string);
    return new SuccessResponse({
        message: `user with id : ${event.pathParameters.id} deleted`,
    });
}

export const deleteUser = async (userId: string): Promise<void> => {
    const query = db.deleteFrom('person').where('id', '=', userId).compile();
    await queryDatabaseAPI(query);
};
