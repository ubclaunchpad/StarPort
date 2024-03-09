import { getDatabase, NewPost } from '../util/db';
import { LambdaBuilder, LambdaInput } from '../util/middleware/middleware';
import { APIResponse, SuccessResponse } from '../util/middleware/response';
import { Authorizer } from '../util/middleware/authorizer';

const db = getDatabase();

export const handler = new LambdaBuilder(router)
    .use(new Authorizer(db))
    .build();

export async function router(
    event: LambdaInput
): Promise<APIResponse> {
    if (!event.body) throw new Error('No body provided');

    const body = JSON.parse(event.body);
    const postParams = {...body , userid: event.user.id} as unknown as NewPost;
    const newPost = await createPost(postParams);
    return new SuccessResponse({
        message: `post with id : ${newPost} created`,
    });
}
export const createPost = async (newPost: NewPost) => {
    newPost.contents = JSON.stringify(newPost.contents);

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
