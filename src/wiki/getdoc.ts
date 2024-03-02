import { LambdaBuilder } from '../util/middleware/middleware';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { APIResponse, SuccessResponse } from '../util/middleware/response';
import { InputValidator } from '../util/middleware/inputValidator';
import { getWikiDatabase } from '../util/wikidb';

const db = getWikiDatabase();

export const handler = new LambdaBuilder(router)
    .use(new InputValidator())
    // Add any additional middleware as needed
    .build();

export async function router(
    event: APIGatewayProxyEvent
): Promise<APIResponse> {
    if (event === null) {
        throw new Error('Event not found');
    }

    if (event.pathParameters === null || !event.pathParameters.doc || !event.pathParameters.area) {
        throw new Error('Request is missing parameters');
    }

    const docName = event.pathParameters.doc;
    const areaName = event.pathParameters.area;

    return new SuccessResponse(await getDoc(docName, areaName));
}

export async function getDoc(docName: string, areaName: string) {
    // retrieve the areaID based on the areaTitle
    const areaRes = await db
        .selectFrom('Area')
        .select(['areaID'])
        .where('name', '=', areaName)
        .executeTakeFirst();

    if (!areaRes) {
        throw new Error('Area not found');
    }

    const areaID = areaRes.areaID;
    console.log('areaID:', areaID);
    console.log('docTitle:', docName);
    // then check if a document with the specified title and areaID exists
    const docRes = await db
        .selectFrom('Documents')
        .select(['docLink'])
        .where('name', '=', docName)
        .where('areaID', '=', areaID)
        .executeTakeFirst();

    if (!docRes) {
        throw new Error('Document not found');
    }

    return {
        docLink: docRes.docLink,
    };
}



// import { S3 } from 'aws-sdk';
// import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

// export const handler = async function (
//     event: APIGatewayProxyEvent
// ): Promise<APIGatewayProxyResult> {
//     try {
//         const s3 = new S3({
//             accessKeyId: process.env.ACCESS_KEY,
//             secretAccessKey: process.env.SECRET_ACCESS_KEY
//         });
//         const bucketName = process.env.BUCKET_NAME;

//         if (event === null) {
//             throw new Error('event not found');
//         }

//         if (!bucketName) {
//             throw new Error('Bucket not connected');
//         }

//         if (event.pathParameters === null) {
//             throw new Error('Request is missing params');
//         }

//         const { area, doc } = event.pathParameters;
//         if (!area || !doc) {
//             throw new Error('Request is missing params');
//         }

//         // ADD STRING.SPLIT METHOD THAT SPLITS LIKE AREA:AREA2:AREA3 AND TURNS INTO AREA/AREA2/AREA3 yup
//         // Retrieve the bucket and key from the event
//         // const objectKey = `${area}/${doc}.md`;
//         const trueArea = area.split(':').join('/');
//         const objectKey = `${trueArea}/${doc}.md`;
//         const getObjectParams: S3.GetObjectRequest = {
//             Bucket: bucketName,
//             Key: objectKey,
//         };
//         const s3Object = await s3.getObject(getObjectParams).promise();
//         const objectData = s3Object.Body?.toString('utf-8');

//         return {
//             headers: {
//                 'Content-Type': 'text/html',
//                 'Access-Control-Allow-Origin': '*',
//             },
//             statusCode: 200,
//             isBase64Encoded: false,
//             body: objectData as string,
//         };
//     } catch (error) {
//         console.log(error);
//         return {
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Access-Control-Allow-Origin': '*',
//             },
//             statusCode: 306,
//             isBase64Encoded: false,
//             body: 'Cannot retrieve resource',
//         };
//     }
// };