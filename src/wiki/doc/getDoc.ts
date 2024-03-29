import { LambdaBuilder } from '../../util/middleware/middleware';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { APIResponse, SuccessResponse } from '../../util/middleware/response';
import { S3 } from 'aws-sdk';
import { getDatabase } from '../../util/db';

const db = getDatabase();

export const handler = new LambdaBuilder(router).build();

export async function router(
    event: APIGatewayProxyEvent
): Promise<APIResponse> {
    if (event === null) {
        throw new Error('Event not found');
    }

    if (event.pathParameters === null || !event.pathParameters.docid) {
        throw new Error('Request is missing parameters');
    }

    const docid = event.pathParameters.docid;

    let docRes;

    if (event.pathParameters.areaid) {
        const areaid = event.pathParameters.areaid as unknown as number;
        docRes = await db
            .selectFrom('document')
            .selectAll()
            .where('document.id', '=', docid as unknown as number)
            .innerJoin('area', 'document.areaid', 'area.id')
            .where('area.id', '=', areaid)
            .executeTakeFirst();
    } else {
        docRes = await db
            .selectFrom('document')
            .selectAll()
            .innerJoin('area', 'document.areaid', 'area.id')
            .where('document.fileid', '=', docid)
            .executeTakeFirst();
    }
    if (!docRes) {
        throw new Error('Document not found');
    }

    const contentQueryParam =
        event.queryStringParameters?.content === 'true' ? true : false;
    const content = contentQueryParam
        ? await getContentTrue(docRes.fileid)
        : null;
    return new SuccessResponse(
        contentQueryParam ? { ...docRes, content } : { ...docRes }
    );
}

export async function getContentTrue(fileid: string): Promise<any> {
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
            Key: fileid,
        };

        const s3Object = await s3.getObject(getObjectParams).promise();
        const objectData = s3Object.Body?.toString('utf-8');

        return objectData;
    } catch (error) {
        console.log(error);
        return {
            msg: 'Error',
        };
    }
}
