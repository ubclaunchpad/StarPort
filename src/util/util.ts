import { APIGatewayProxyResult } from 'aws-lambda/trigger/api-gateway-proxy';
import serverlessMysql from 'serverless-mysql';
import { config } from 'dotenv';
config();

export interface IDatabaseConfig {
    host: string;
    user: string;
    password: string;
    database: string;
}

export class DATABASE_CONFIG {
    public static readonly DB_HOST = process.env.DB_HOST;
    public static readonly DB_USERNAME = process.env.DB_USERNAME;
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
        return {
            host: DATABASE_CONFIG.DB_HOST,
            user: DATABASE_CONFIG.DB_USERNAME,
            password: DATABASE_CONFIG.DB_PASSWORD,
            database: DATABASE_CONFIG.DB_NAME,
        };
    }
}

const connectToDb = (config: IDatabaseConfig) => {
    return serverlessMysql({
        config: {
            ...config,
            port: 3306,
        },
    });
};

export const mysql = connectToDb(DATABASE_CONFIG.getDBConfig());

export const formatResponse = (
    statusCode: number,
    body: unknown
): APIGatewayProxyResult => {
    return {
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
        },
        statusCode: statusCode,
        isBase64Encoded: false,
        body: JSON.stringify(body),
    };
};
