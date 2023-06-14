import { APIGatewayProxyResult } from 'aws-lambda/trigger/api-gateway-proxy';
import servlessSql from 'serverless-mysql';
import { config } from 'dotenv';
config();
export const mysql = null

export interface IDatabaseConfig {
    host: string;
    user: string;
    password: string;
    database: string;
}

export class DATABASE_CONFIG {
    public static readonly DB_HOST = process.env.DB_HOST;
    public static readonly DB_USERNAME =  process.env.DB_USERNAME;
    public static readonly DB_PASSWORD = process.env.DB_PASSWORD;
    public static readonly DB_NAME = process.env.DB_NAME;

    public static getDBConfig(): IDatabaseConfig {
        if (
            !DATABASE_CONFIG.DB_HOST ||
            !DATABASE_CONFIG.DB_USERNAME ||
            !DATABASE_CONFIG.DB_PASSWORD ||
            !DATABASE_CONFIG.DB_NAME
        ) {
            throw new Error('Database configuration not found');
        }
        console.log(DATABASE_CONFIG.DB_HOST);
        console.log(DATABASE_CONFIG.DB_USERNAME);
        console.log(DATABASE_CONFIG.DB_PASSWORD);
        console.log(DATABASE_CONFIG.DB_NAME);
        return {
            host: DATABASE_CONFIG.DB_HOST,
            user: DATABASE_CONFIG.DB_USERNAME,
            password: DATABASE_CONFIG.DB_PASSWORD,
            database: DATABASE_CONFIG.DB_NAME
        };
    }
}

export const connectToDb =  (config: IDatabaseConfig) => {
    return servlessSql({config: {
        ...config,
        port: 3306
        // password: "Armin1378!"
    }});
}

export const formatResponse = (
    statusCode: number,
    body: any
): APIGatewayProxyResult => {
    return {
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        statusCode: statusCode,
        isBase64Encoded: false,
        body: JSON.stringify(body),
    };
};
