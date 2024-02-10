import { S3 } from 'aws-sdk';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

export const handler = async function (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
    try {
        const s3 = new S3({
            accessKeyId: process.env.ACCESS_KEY,
            secretAccessKey: process.env.SECRET_ACCESS_KEY
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

        const trueArea = area.split(':').join('/');
        const objectKey = `${trueArea}/${doc}.md`;

    // Assuming the body of the request contains the content of the file
        const objectData = event.body || '';

        // Use putObject to upload the object
        const putObjectParams: S3.PutObjectRequest = {
            Bucket: bucketName,
            Key: objectKey,
            Body: objectData,
            ContentType: 'text/html', // Adjust the content type accordingly
        };

        await s3.putObject(putObjectParams).promise();

        return {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            statusCode: 200,
            isBase64Encoded: false,
            body: JSON.stringify({ message: 'Object uploaded successfully' }),
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
            body: JSON.stringify({ error: 'Cannot retrieve/upload resource' }),
        };
    }
};
