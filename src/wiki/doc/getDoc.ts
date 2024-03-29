import { LambdaBuilder } from '../../util/middleware/middleware';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { APIResponse, SuccessResponse } from '../../util/middleware/response';
// import { InputValidator } from '../util/middleware/inputValidator';
import { S3 } from 'aws-sdk';
import { getDatabase } from '../../util/db';

const db = getDatabase();

export const handler = new LambdaBuilder(router)
    // .use(new InputValidator())
    // Add any additional middleware as needed
    .build();

export async function router(
    event: APIGatewayProxyEvent
): Promise<APIResponse> {
    if (event === null) {
        throw new Error('Event not found');
    }

    if (
        event.pathParameters === null ||
        !event.pathParameters.docid ||
        !event.pathParameters.areaid
    ) {
        throw new Error('Request is missing parameters');
    }

    const docid = event.pathParameters.docid as unknown as number;
    const areaName = event.pathParameters.areaid;

    // then check if a document with the specified title and areaID exists
    const docRes = await db
        .selectFrom('documents')
        .select(['doclink'])
        .where('id', '=', docid)
        .innerJoin('area', 'documents.areaid', 'area.id')
        .where('area.name', '=', areaName)
        .executeTakeFirst();

    if (!docRes) {
        throw new Error('Document not found');
    }

    const contentQueryParam =
        Boolean(event.queryStringParameters?.content || false) ?? false;
    const content = contentQueryParam
        ? await getContentTrue(docRes.doclink)
        : null;
    return new SuccessResponse(
        contentQueryParam ? { ...docRes, content } : { ...docRes }
    );
}

export async function getContentTrue(doclink: string): Promise<any> {
    try {
        const s3 = new S3({
            accessKeyId: process.env.ACCESS_KEY,
            secretAccessKey: process.env.SECRET_ACCESS_KEY,
        });

        const bucketName = process.env.BUCKET_NAME;

        if (!bucketName) {
            throw new Error('Bucket not connected');
        }

        const getObjectParams: S3.GetObjectRequest = {
            Bucket: bucketName,
            Key: doclink,
        };

        const s3Object = await s3.getObject(getObjectParams).promise();
        const objectData = s3Object.Body?.toString('utf-8');
        console.log('objectData:', objectData);

        return objectData;
    } catch (error) {
        console.log(error);
        return {
            msg: 'Error',
        };
    }
}
