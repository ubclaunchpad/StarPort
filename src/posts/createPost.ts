import { getDatabase, NewPost } from '../util/db';
import { LambdaBuilder } from '../util/middleware/middleware';
import { APIResponse, SuccessResponse } from '../util/middleware/response';
import { InputValidator } from '../util/middleware/inputValidator';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { Authorizer } from '../util/middleware/authorizer';

const db = getDatabase();

export const handler = new LambdaBuilder(router)
    .use(new InputValidator())
    .use(new Authorizer({shouldGetUser: true, db: db}))
    .build();

export async function router(
    event: APIGatewayProxyEvent
): Promise<APIResponse> {
    if (!event.body) throw new Error('No body provided');

    const body = JSON.parse(event.body);
    const postParams = {body , userid: body.user.id} as unknown as NewPost;
    const newPost = await createPost(postParams);
    return new SuccessResponse({
        message: `post with id : ${newPost} created`,
    });
}
export const createPost = async (newPost: NewPost) => {
    console.log(newPost.contents);
    newPost.contents = JSON.stringify(newPost.contents);
    console.log(newPost.contents);

    try {
        const { insertId } = await db
            .insertInto('post')
            .values(newPost)
            .executeTakeFirst();
        return insertId;
    
    } catch (error) {
        console.log(error);
        throw new Error('Error creating announcement');
    }
};
