import { getDatabase, NewPost } from '../util/db';
import { LambdaBuilder, LambdaInput } from '../util/middleware/middleware';
import { APIResponse, SuccessResponse } from '../util/middleware/response';
import { Authorizer } from '../util/middleware/authorizer';

const db = getDatabase();

export const handler = new LambdaBuilder(router)
    .use(new Authorizer(db, { shouldGetUser: true }))
    .build();

export async function router(
    event: LambdaInput
): Promise<APIResponse> {
    if (!event.body) throw new Error('No body provided');

    const body = JSON.parse(event.body);
    console.log(event.googleAccount.id);
    console.log(event.googleAccount.email);

    const postParams = {...body , userid: event.googleAccount.id} as unknown as NewPost;
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
