import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { formatResponse, mysql } from "./util";
import { PostingQueryI } from "./project";

export const handler = async function(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    const params = (event && event.queryStringParameters) || {}
    const resp =  await getAll(params as PostingQueryI);
    mysql.end();
    return formatResponse(200, resp);

  } catch(error) {
    return formatResponse(200, {message: (error as any).message});
  }
};

export async function getAll(postingQuery: PostingQueryI) {
    let query =`SELECT
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
      1=1
    GROUP BY
      p.id
    HAVING 
      1 = 1 `;

    if (postingQuery.projectId) {
        query += ` AND p.project_id = ${postingQuery.projectId}`;
    }

    if (postingQuery.limit && postingQuery.offset) {
      query += ` LIMIT ${postingQuery.limit} OFFSET ${postingQuery.offset}`;
    } else {
      query += ` LIMIT 20 OFFSET 0`;
    }
  
    const postings = await mysql.query(query) as any[];  
    if (!postings) {
      throw new Error('posting(s) not found');
    }

    if (postings.length === 0) {
        return [];
    }
    return postings;
  }
  