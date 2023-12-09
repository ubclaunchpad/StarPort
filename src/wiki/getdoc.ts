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

        // ADD STRING.SPLIT METHOD THAT SPLITS LIKE AREA:AREA2:AREA3 AND TURNS INTO AREA/AREA2/AREA3 yup
        // Retrieve the bucket and key from the event
        // const objectKey = `${area}/${doc}.md`;
        const trueArea = area.split(':').join('/');
        const objectKey = `${trueArea}/${doc}.md`;
        console.log('objectKey:', objectKey)
        const getObjectParams: S3.GetObjectRequest = {
            Bucket: bucketName,
            Key: objectKey,
        };
        console.log('objectParams:', getObjectParams)
        const s3Object = await s3.getObject(getObjectParams).promise();
        const objectData = s3Object.Body?.toString('utf-8');
        console.log('here?', getObjectParams)
        console.log(s3Object)
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