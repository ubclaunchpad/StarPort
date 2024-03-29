import { S3 } from 'aws-sdk';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { LambdaBuilder } from '../../util/middleware/middleware';
import {
    APIResponse,
    SuccessResponse,
    APIErrorResponse,
} from '../../util/middleware/response';
// import { Authorizer } from '../../util/middleware/authorizer';
import { getDatabase } from '../../util/db';

const s3 = new S3({
    accessKeyId: process.env.ACCESS_KEY,
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

    const { areaid, docid } = event.pathParameters;
    if (!areaid || !docid) {
        throw new Error('Request is missing params');
    }

    const docData = JSON.parse(event.body || '');

    if (!docData) {
        throw new Error('Request is missing body or body is invalid');
    }

    try {
        await updateDocument(areaid, docid, docData);
        return new SuccessResponse({
            message: 'Document created successfully',
        });
    } catch (error) {
        console.error('Error in createDocument:', error);
        return new APIErrorResponse(error);
    }
}

export const updateDocument = async (
    areaid: string,
    docid: string,
    docData: { title: string; content: string }
) => {
    const doc = await db
        .selectFrom('document')
        .selectAll()
        .where('id', '=', docid as unknown as number)
        .executeTakeFirst();

    if (!doc) {
        throw new Error('Document not found');
    }

    const objectKey = doc?.fileid;
    const putObjectParams: S3.PutObjectRequest = {
        Bucket: bucketName,
        Key: objectKey,
        Body: docData.content,
        ContentType: 'text/html', // Adjust the content type accordingly
    };

    await s3.putObject(putObjectParams).promise();
    return doc.id;
};

export const verifyDocumentCreation = async (
    areaid: string,
    docid: string,
    docData: { title: string; content: string }
) => {
    // Check if the area already exists
    const areaIdKey = Number(areaid);
    const docIdKey = Number(docid);
    const res = await db
        .selectFrom('document')
        .select(['id'])
        .where('id', '=', docIdKey)
        .innerJoin('area', 'document.areaid', 'area.id')
        .where('id', '=', areaIdKey)
        .executeTakeFirst();

    if (!res) {
        throw new Error('No matching area or document found');
    }
};
