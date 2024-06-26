import { S3 } from 'aws-sdk';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { LambdaBuilder } from '../../util/middleware/middleware';
import {
    APIResponse,
    SuccessResponse,
    APIErrorResponse,
} from '../../util/middleware/response';
// import { Authorizer } from '../../util/middleware/authorizer';
import { NewDocument, getDatabase } from '../../util/db';
import { v4 as uuidv4 } from 'uuid';

const s3 = new S3({
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
});
const bucketName = process.env.BUCKET_NAME || '';

const db = getDatabase();

export const handler = new LambdaBuilder(router)
    // .use(new Authorizer(db))
    .build();

export async function router(
    event: APIGatewayProxyEvent
): Promise<APIResponse> {
    if (event === null) {
        throw new Error('event not found');
    }

    if (!bucketName) {
        throw new Error('Bucket not connected');
    }

    if (event.pathParameters === null) {
        throw new Error('Request is missing params');
    }

    const { areaid } = event.pathParameters;
    if (!areaid) {
        throw new Error('Request is missing params');
    }

    const docData = JSON.parse(event.body || '');

    if (!docData || !docData.title || docData.content === undefined) {
        throw new Error('Request is missing body or body is invalid');
    }

    try {
        await verifyDocumentCreation(areaid);
        await createDocument(areaid, docData);
        return new SuccessResponse({
            message: 'Document created successfully',
        });
    } catch (error) {
        console.error('Error in createDocument:', error);
        return new APIErrorResponse(error);
    }
}

export const createDocument = async (
    areaid: string,
    docData: { title: string; content: string }
) => {
    const objectid = uuidv4();
    const docArgs: NewDocument = {
        areaid: Number(areaid),
        title: docData.title,
        fileid: objectid,
    };

    const putObjectParams: S3.PutObjectRequest = {
        Bucket: bucketName,
        Key: objectid,
        Body: docData.content,
        ContentType: 'text/html',
    };
    await s3.putObject(putObjectParams).promise();
    const { insertId } = await db
        .insertInto('document')
        .values(docArgs)
        .executeTakeFirst();
    return insertId;
};

export const verifyDocumentCreation = async (areaid: string) => {
    const areaIdKey = Number(areaid);
    const areaRes = await db
        .selectFrom('area')
        .select(['id'])
        .where('id', '=', areaIdKey)
        .executeTakeFirst();

    if (!areaRes) {
        throw new Error('Area not found');
    }
    return;
};
