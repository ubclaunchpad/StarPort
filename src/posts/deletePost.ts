import { getDatabase } from '../util/db';
import { LambdaBuilder } from '../util/middleware/middleware';
import { APIResponse, SuccessResponse } from '../util/middleware/response';
import { InputValidator } from '../util/middleware/inputValidator';
import { APIGatewayEvent } from 'aws-lambda';

const db = getDatabase();

export const handler = new LambdaBuilder(router)
    .use(new InputValidator())
    .build();

export async function router(event: APIGatewayEvent): Promise<APIResponse> {
    const q = event.pathParameters;
    if (q && q.aid) {
        const post = await deletePost(Number(q.aid));
        return new SuccessResponse(post);
    } else {
        throw new Error('No id provided');
    }
}
export const deletePost = async (id: number) => {
    const post = await db.deleteFrom('post').where('id', '=', id).execute();
    return post;
};
