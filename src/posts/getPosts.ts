import { getDatabase } from '../util/db';
import { LambdaBuilder } from '../util/middleware/middleware';
import { APIResponse, SuccessResponse } from '../util/middleware/response';
import { InputValidator } from '../util/middleware/inputValidator';
import { APIGatewayEvent } from 'aws-lambda';
import { S3 } from 'aws-sdk';


const db = getDatabase();

export const handler = new LambdaBuilder(router)
    .use(new InputValidator())
    // .use(new Authorizer())
    .build();

export async function router(
    event: APIGatewayEvent

): Promise<APIResponse> {
    const q = event.queryStringParameters;

    const s3 = new S3({
        accessKeyId: process.env.ACCESS_KEY,
        secretAccessKey: process.env.SECRET_ACCESS_KEY
    });

    console.log(s3)
    if (q && q.teamid) {
        const team = await getPosts(Number(q.teamid));
        return new SuccessResponse(team);
    } else {
        const teams = await getPosts();
        return new SuccessResponse(teams);
    }
}
export const getPosts = async (teamid?: number) => {
    let posts = await db
        .selectFrom('post')
        .innerJoin('person', 'person.id', 'post.userid')
        .select(['person.email', 'person.first_name', 'person.last_name', 'post.contents',
        'post.status', 'post.updated_at', 'post.id', 'post.title', 'post.teamid', 'post.userid', 'post.type', 
        'post.created_at'
    ])
        .$if(teamid !== undefined, (query) => query.where('teamid', '=', teamid as number))
        .orderBy('updated_at desc')
        .execute();

    posts = posts.map((post: any) => {
        return {...post, author: `${post.first_name} ${post.last_name}`};
    });

    return posts;
}