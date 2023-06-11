import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { formatResponse, mysql } from '../util/util';

export const handler = async function (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
    try {
        if (event === null) {
            throw new Error('event not found');
        }

        if (event.pathParameters === null || event.pathParameters.id === null) {
            throw new Error('Posting Id is missing');
        }

        const resp = await getPosting(Number(event.pathParameters.id));
        mysql.end();

        return formatResponse(200, resp);
    } catch (error) {
        return formatResponse(200, { message: (error as any).message });
    }
};

export async function getPosting(postingId: number): Promise<any> {
    const query = `SELECT
    p.id AS id,
    p.title,
    p.project_role_id AS roleId,
    p.project_id AS projectId,
    proj.name AS projectName,
      (
        SELECT COUNT(*)
        FROM application app
        WHERE app.posting_id = p.id
      ) AS applications
    FROM
      posting p
    INNER JOIN
      project proj ON p.project_id = proj.id
    LEFT JOIN
      application app ON p.id = app.posting_id
    WHERE
      p.id = ${postingId}
    GROUP BY
      p.id
    HAVING 
      1 = 1 `;

    const posting = (await mysql.query(query)) as any[];
    if (!posting) {
        throw new Error('posting not found');
    }

    return posting[0];
}
