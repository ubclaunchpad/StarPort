import { S3 } from 'aws-sdk';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { LambdaBuilder } from '../../util/middleware/middleware';
import {
    APIResponse,
    SuccessResponse,
    APIErrorResponse,
} from '../../util/middleware/response';
// import { Authorizer } from '../../util/middleware/authorizer';
import { NewDocuments, getDatabase } from '../../util/db';

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

    if (!docData || !docData.title || !docData.content) {
        throw new Error('Request is missing body or body is invalid');
    }

    try {
        await verifyDocumentCreation(areaid, docid, docData);
        await createDocument(areaid, docid, docData);
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
    docid: string,
    docData: { title: string; content: string }
) => {
    const objectKey = `${areaid}/${docid}.md`;
    const putObjectParams: S3.PutObjectRequest = {
        Bucket: bucketName,
        Key: objectKey,
        Body: docData.content,
        ContentType: 'text/html', // Adjust the content type accordingly
    };

    const areaIdKey = Number(areaid);
    await s3.putObject(putObjectParams).promise();

    const docArgs: NewDocuments = {
        areaid: areaIdKey,
        title: docData.title,
        doclink: objectKey,
    };

    const { insertId } = await db
        .insertInto('document')
        .values(docArgs)
        .executeTakeFirst();

    return insertId;
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
