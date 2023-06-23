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
            throw new Error('User Id is missing');
        }

        const resp = await deleteUser(event.pathParameters.id as string);
        return formatResponse(200, resp);
    } catch (error) {
        return formatResponse(400, { message: (error as Error).message });
    } finally {
        mysql.end();
    }
};

export const deleteUser = async (userId: string): Promise<void> => {
    return mysql.query(`DELETE FROM person WHERE id = ?`, [userId]);
};
