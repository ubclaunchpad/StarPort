import {getDatabaseParser, queryDatabaseAPI} from '../util/db';
import { LambdaBuilder } from '../util/middleware/middleware';
import { SuccessResponse } from '../util/middleware/response';
import { InputValidator } from '../util/middleware/inputValidator';
import { APIGatewayEvent } from 'aws-lambda';
import { Authorizer } from '../util/middleware/authorizer';

const db = getDatabaseParser();
export const handler = new LambdaBuilder(deleteStandingRequest)
    .use(new InputValidator())
    .use(new Authorizer())
    .build();

async function deleteStandingRequest(event: APIGatewayEvent) {
    const { id } = JSON.parse(event.body);
    await deleteStanding(id);
    return new SuccessResponse({message: "Standing deleted"});
}

export const deleteStanding = async (id: string) => {
    const query =  db.deleteFrom('standing').where('id', '=', id).compile();
    await queryDatabaseAPI(query);
};
