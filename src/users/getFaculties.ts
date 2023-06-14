import { APIGatewayProxyResult } from 'aws-lambda';
import { formatResponse, connectToDb, DATABASE_CONFIG } from '../util/util';

const mysql = connectToDb(DATABASE_CONFIG.getDBConfig());


export const handler = async function (): Promise<APIGatewayProxyResult> {
    try {
        const result = await getFacultyIdsAndNames();
        mysql.end();
        return formatResponse(200, result);
    } catch (error) {
        console.log('error');
        return formatResponse(200, { message: (error as any).message });
    }
};

export const getFacultyIdsAndNames = async () => {
    const result = await mysql.query(
        `SELECT JSON_OBJECTAGG(faculty_id, faculty_name) FROM faculty`
    );
    return (await result) || {};
};
