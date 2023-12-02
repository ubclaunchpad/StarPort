import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { S3 } from 'aws-sdk';

export const handler = async function (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
    try {
        const s3 = new S3({
            accessKeyId: process.env.IAM_ACCESS_KEY,
            secretAccessKey: process.env.IAM_SECRET_ACCESS_KEY
        });
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

        // Delete object
        const deleteObjectParams: S3.DeleteObjectRequest = {
            Bucket: bucketName,
            Key: objectKey,
        };

        await s3.deleteObject(deleteObjectParams).promise();

        return {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            statusCode: 200,
            isBase64Encoded: false,
            body: JSON.stringify({ message: 'File deleted successfully' })
        };
    } catch (error) {
        console.log(error);
        return {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            statusCode: 500,
            isBase64Encoded: false,
            body: JSON.stringify({ error: 'Cannot delete resource' }),
        };
    }
};
