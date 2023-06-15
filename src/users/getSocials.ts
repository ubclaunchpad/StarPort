import { APIGatewayProxyResult } from 'aws-lambda';
import { formatResponse, mysql } from '../util/util';
import { IQueryObjectResult } from '../util/types/query';

export const handler = async function (): Promise<APIGatewayProxyResult> {
    try {
        const result = await getSocialIdsAndNames();
        mysql.end();
        return formatResponse(200, result);
    } catch (error) {
        return formatResponse(400, { message: (error as Error).message });
    }
};

export const getSocialIdsAndNames = async () => {
    const result = await mysql.query<
        SocialQueryResultArray[]
    >(`SELECT JSON_OBJECTAGG(sm.id, JSON_OBJECT('id', sm.id, 'name', sm.name, 'domain', sm.domain)) AS socials
    FROM social_media sm`);

    return result[0].socials || {};
};

export interface ISocial {
    id: number;
    name: string;
    domain: string;
}

export interface SocialQueryResultArray {
    socials: IQueryObjectResult<ISocial>;
}
