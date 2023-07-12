import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { S3 } from 'aws-sdk';

export const handler = async function (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
    try {
        const s3 = new S3();
        const bucketName = process.env.BUCKET_NAME;

        if (event === null) {
            throw new Error('event not found');
        }

        if (!bucketName) {
            throw new Error('Bucket not connected');
        }

        if (event.pathParameters === null) {
            throw new Error('Request is missing params');
        }

        const { area, doc } = event.pathParameters;
        if (!area || !doc) {
            throw new Error('Request is missing params');
        }

        // Retrieve the bucket and key from the event
        const objectKey = `${area}/${doc}.md`;

        const getObjectParams: S3.GetObjectRequest = {
            Bucket: bucketName,
            Key: objectKey,
        };

        const s3Object = await s3.getObject(getObjectParams).promise();
        const objectData = s3Object.Body?.toString('utf-8');
        console.log(objectData);
        return {
            headers: {
                'Content-Type': 'text/html',
                'Access-Control-Allow-Origin': '*',
            },
            statusCode: 200,
            isBase64Encoded: false,
            body: objectData as string,
        };
    } catch (error) {
        console.log(error);
        return {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            statusCode: 306,
            isBase64Encoded: false,
            body: 'Cannot retrieve resource',
        };
    }
};
