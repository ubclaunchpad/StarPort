import { LambdaBuilder } from '../util/middleware/middleware';
// import { APIGatewayProxyEvent } from 'aws-lambda';
import { APIResponse, SuccessResponse } from '../util/middleware/response';
import { InputValidator } from '../util/middleware/inputValidator';
import { getDatabase } from '../util/db';
import { S3 } from 'aws-sdk';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

const db = getDatabase();
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

    if (
        event.pathParameters === null ||
        !event.pathParameters.doc ||
        !event.pathParameters.area
    ) {
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
        .select([
            'id',
            'name',
            'areaID',
            'title',
            'docLink',
            'lastEditedUser',
            'creationDate',
            'lastUpdatedDate',
        ])
        .where('name', '=', docName)
        .where('areaID', '=', areaID)
        .executeTakeFirst();

    if (!docRes) {
        throw new Error('Document not found');
    }

    return {
        docID: docRes.id,
        name: docRes.name,
        areaID: docRes.areaID,
        title: docRes.title,
        docLink: docRes.docLink,
        lastEditedUser: docRes.lastEditedUser,
        creationDate: docRes.creationDate,
        lastUpdatedDate: docRes.lastUpdatedDate,
    };
}
