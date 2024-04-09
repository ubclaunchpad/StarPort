import { config } from 'dotenv';
config();

export interface IDatabaseConfig {
    DATABASE_HOST: string;
    DATABASE_USERNAME: string;
    DATABASE_PASSWORD: string;
    DATABASE_PORT: string;
    DATABASE_NAME: string;
}

export class DATABASE_CONFIG {
    public static readonly DB_HOST: string | undefined =
        process.env.DATABASE_HOST;
    public static readonly DB_USERNAME: string | undefined =
        process.env.DATABASE_USERNAME;
    public static readonly DB_PASSWORD: string | undefined =
        process.env.DATABASE_PASSWORD;
    public static readonly DB_PORT: string | undefined =
        process.env.DATABASE_PORT || '5432';
    public static readonly DB_NAME: string | undefined =
        process.env.DATABASE_NAME;

    public static getDBConfig(): IDatabaseConfig {
        if (
            !DATABASE_CONFIG.DB_HOST ||
            !DATABASE_CONFIG.DB_USERNAME ||
            !DATABASE_CONFIG.DB_PASSWORD ||
            !DATABASE_CONFIG.DB_PORT ||
            !DATABASE_CONFIG.DB_NAME
        ) {
            throw new Error('Database configuration not found');
        }
        return {
            DATABASE_HOST: DATABASE_CONFIG.DB_HOST,
            DATABASE_USERNAME: DATABASE_CONFIG.DB_USERNAME,
            DATABASE_PASSWORD: DATABASE_CONFIG.DB_PASSWORD,
            DATABASE_PORT: DATABASE_CONFIG.DB_PORT,
            DATABASE_NAME: DATABASE_CONFIG.DB_NAME,
        };
    }
}
