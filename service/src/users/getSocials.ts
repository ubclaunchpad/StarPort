import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { formatResponse, mysql } from "./util";

export const handler = async function(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    try {    
     const result = await getSocialIdsAndNames();
     mysql.end();
     return formatResponse(200, result);

    } catch(error) {
      return formatResponse(400, {message: (error as any).message});
    }
};

export const getSocialIdsAndNames = async () => {
    const result = await mysql.query(`SELECT JSON_OBJECTAGG(sm.id, JSON_OBJECT('id', sm.id, 'name', sm.name, 'domain', sm.domain)) AS socials
    FROM social_media sm`);

    // parse the JSON object
    const socials = JSON.parse((result as any)[0].socials);
    return await socials || {};
}
