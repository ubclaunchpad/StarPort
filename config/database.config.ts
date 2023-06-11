import { config } from 'dotenv';
config();

export interface IDatabaseConfig {
    host: string;
    user: string;
    password: string;
    database: string;
}

export class DATABASE_CONFIG {
    public static readonly DB_HOST: string | undefined = process.env.DB_HOST;
    public static readonly DB_USERNAME: string | undefined =
        process.env.DB_USERNAME;
    public static readonly DB_PASSWORD: string | undefined =
        process.env.DB_PASSWORD;
    public static readonly DB_NAME: string | undefined = process.env.DB_NAME;

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
