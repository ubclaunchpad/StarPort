import { APIGatewayProxyResult } from 'aws-lambda';
import { formatResponse, connectToDb, DATABASE_CONFIG } from '../util/util';
import { IQueryObjectResult } from '../util/types/query';
const mysql = connectToDb(DATABASE_CONFIG.getDBConfig());

export const handler = async function (): Promise<APIGatewayProxyResult> {
    try {
        const result = await getFacultyIdsAndNames();
        mysql.end();
        return formatResponse(200, result);
    } catch (error) {
        return formatResponse(400, { message: (error as Error).message });
    }
};

export const getFacultyIdsAndNames = async () => {
    const result = await mysql.query<FacultyQueryResultArray>(
        `SELECT JSON_OBJECTAGG(faculty_id, faculty_name) as faculty FROM faculty `
    );
    return JSON.parse(result[0].faculty) || {};
};


type FacultyQueryResultArray = IQueryObjectResult<string>[];