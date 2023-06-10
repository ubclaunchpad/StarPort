import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { formatResponse, mysql } from "./util";

export const handler = async function(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    try {    
     const result = await getFacultyIdsAndNames();
     mysql.end();
     return formatResponse(200, result);

    } catch(error) {
      return formatResponse(200, {message: (error as any).message});
    }
};

export const getFacultyIdsAndNames = async () => {
    const result = await mysql.query(`SELECT JSON_OBJECTAGG(faculty_id, faculty_name) FROM faculty`);
    return await result || {};
}
