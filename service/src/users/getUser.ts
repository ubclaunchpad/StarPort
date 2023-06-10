import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { formatResponse, mysql } from "./util";

export const handler = async function(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    try {
     if (event === null) {
        throw new Error('event not found');
      }
  
      if (event.pathParameters === null || event.pathParameters.id === null) {
          throw new Error('User Id is missing');
      }
    
     const resp = await getUser(Number(event.pathParameters.id ) );
     mysql.end();

     return formatResponse(200, resp);
      } catch(error) {
    return formatResponse(200, {message: (error as any).message});
      }
};

  export async function getUser(userId: number) {
    const result = await mysql.query(`SELECT
    p.user_id AS userId,
    p.email,
    p.first_name AS firstName,
    p.pref_name AS prefName,
    p.last_name AS lastName,
    p.resumelink AS resumeLink,
    s.standing_id AS standing,
    f.faculty_id AS faculty
FROM
    person p
    INNER JOIN faculty f ON p.faculty_id = f.faculty_id
    LEFT JOIN person_degree_program pdp ON p.user_id = pdp.user_id
    LEFT JOIN degree_program dp ON pdp.program_id = dp.program_id
    LEFT JOIN person_social_media psm ON p.user_id = psm.user_id
    INNER JOIN standing s ON p.standing_id = s.standing_id
    WHERE p.user_id = ?`, [userId]);

    const users = result as any[]

    const programs = await mysql.query(`SELECT
    p.program_id AS id FROM person_degree_program p WHERE p.user_id = ?`, [userId]);

    const socialMedia = await mysql.query(`SELECT
    psm.social_media_id AS id,
    psm.url,
    psm.handle
FROM
    person_social_media psm
WHERE
    psm.user_id = ?`, [userId]);

    if (users.length === 0) {
      throw new Error('User not found');
    }

    const user = users[0];


    user.socialMedia = socialMedia;
    user.programs = programs;
    return user;
}
