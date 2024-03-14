import { LambdaBuilder } from '../util/middleware/middleware';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { APIResponse, SuccessResponse } from '../util/middleware/response';
// import { InputValidator } from '../util/middleware/inputValidator';
import { S3 } from 'aws-sdk';
import { getDatabase } from '../util/db';

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
        !event.pathParameters.doc ||
        !event.pathParameters.area
    ) {
        throw new Error('Request is missing parameters');
    }

    const docName = event.pathParameters.doc;
    const areaName = event.pathParameters.area;

    const areaRes = await db
        .selectFrom('Area')
        .select(['id'])
        .where('name', '=', areaName)
        .executeTakeFirst();

    if (!areaRes) {
        throw new Error('Area not found');
    }

    const areaID = areaRes.id;

    // then check if a document with the specified title and areaID exists
    const docRes = await db
        .selectFrom('Documents')
        .select(['docLink'])
        .where('name', '=', docName)
        .where('id', '=', areaID)
        .executeTakeFirst();

    if (!docRes) {
        throw new Error('Document not found');
    }

    // Access query parameters

    const contentQueryParam = event.queryStringParameters?.content;

    console.log('contentQueryParam:', contentQueryParam);

    if (contentQueryParam === 'true') {
        // Execute logic based on the 'content' query parameter
        return new SuccessResponse(
            await getContentTrue(docName, areaName, docRes.docLink)
        );
    } else {
        return new SuccessResponse(
            await getContentFalse(docName, areaName, docRes.docLink)
        );
    }
}

export async function getContentTrue(
    docName: string,
    areaName: string,
    docLink: string
): Promise<any> {
    try {
        const s3 = new S3({
            accessKeyId: process.env.ACCESS_KEY,
            secretAccessKey: process.env.SECRET_ACCESS_KEY,
        });

        const bucketName = process.env.BUCKET_NAME;

        console.log('bucketName:', bucketName);
        if (!bucketName) {
            throw new Error('Bucket not connected');
        }

        // ADD STRING.SPLIT METHOD THAT SPLITS LIKE AREA:AREA2:AREA3 AND TURNS INTO AREA/AREA2/AREA3
        const trueArea = areaName.split(':').join('/');
        const objectKey = `${trueArea}/${docName}.md`;
        console.log('objectKey:', objectKey);

        const getObjectParams: S3.GetObjectRequest = {
            Bucket: bucketName,
            Key: objectKey,
        };

        const s3Object = await s3.getObject(getObjectParams).promise();
        const objectData = s3Object.Body?.toString('utf-8');
        console.log('objectData:', objectData);

        return {
            body: 'Object uploaded successfully',
        };
    } catch (error) {
        console.log(error);
        return {
            msg: 'Error',
        };
    }
}

export async function getContentFalse(
    docName: string,
    areaName: string,
    docLink: string
) {
    return {
        docLink: docLink,
        param: 'false',
    };
}
