import { config } from 'dotenv';
config();

export interface IDatabaseConfig {
    DATABASE_HOST: string;
    DATABASE_USERNAME: string;
    DATABASE_PASSWORD: string;
}

export class DATABASE_CONFIG {
    public static readonly DB_HOST: string | undefined = process.env.DATABASE_HOST;
    public static readonly DB_USERNAME: string | undefined =
        process.env.DATABASE_USERNAME;
    public static readonly DB_PASSWORD: string | undefined =
        process.env.DATABASE_PASSWORD;

    public static getDBConfig(): IDatabaseConfig {
        if (
            !DATABASE_CONFIG.DB_HOST ||
            !DATABASE_CONFIG.DB_USERNAME ||
            !DATABASE_CONFIG.DB_PASSWORD 
        ) {
            throw new Error('Database configuration not found');
        }
        return {
            DATABASE_HOST: DATABASE_CONFIG.DB_HOST,
            DATABASE_USERNAME: DATABASE_CONFIG.DB_USERNAME,
            DATABASE_PASSWORD: DATABASE_CONFIG.DB_PASSWORD,
        };
    }
}
