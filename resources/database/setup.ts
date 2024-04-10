import chalk from 'chalk';
import dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { Client } from 'pg';
dotenv.config();

const DATABASE_NAME = process.env.DATABASE_NAME;
const MIGRATION_PATH = './resources/database/migrations';
const withResetFlagIndex = process.argv.indexOf('--withreset');
const withReset = withResetFlagIndex !== -1;

const setUpDatabase = async (
    client: Client,
    withReset = false
): Promise<void> => {
    await client.connect();
    console.log(chalk.blue('INFO: ') + 'Setting up database');
    createDatabaseIfNotExists(client, DATABASE_NAME);
    const dbClient = new Client({
        host: process.env.DATABASE_HOST,
        user: process.env.DATABASE_USERNAME,
        password: process.env.DATABASE_PASSWORD,
        database: DATABASE_NAME,
        port: parseInt(process.env.DATABASE_PORT || '5432'),
    });

    try {
    await dbClient.connect();

    console.log(chalk.blue('INFO: ') + 'Checking if migrations table exists');

    if (withReset) {
        await initializeDatabase(dbClient);
    } else {
        console.log(
            chalk.blue('INFO: ') +
                'Migrations table already exists. Skipping initialization'
        );
    }
    await runMigrations(dbClient);
} catch (error) {
    console.error(chalk.bgRed('Error setting up database:'));
    await dbClient.end();
    throw error;
} finally {
    await dbClient.end();
}
};

const initializeDatabase = async (client: Client): Promise<void> => {
    await resetDatabase(client);
    console.log(
        chalk.blue('INFO: ') +
            'Creating database ' +
            chalk.bold.underline(DATABASE_NAME)
    );

    await client.query(`CREATE TABLE IF NOT EXISTS migrations (
             id SERIAL PRIMARY KEY,
             timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
             status VARCHAR(255) NOT NULL DEFAULT 'pending'
         )`);
};

const resetDatabase = async (client: Client): Promise<void> => {
    const result = await client.query(
        `SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema NOT IN ('pg_catalog', 'information_schema') 
        AND table_schema = 'public'
        AND table_type = 'BASE TABLE';`
    );

    console.log(
        chalk.bold('Emptying database ' + chalk.bold.underline(DATABASE_NAME))
    );

    const tableNames = result.rows.map((table) => table.table_name);

    if (tableNames.length > 0) {
        const tableDropQuery = `DROP TABLE IF EXISTS ${tableNames.join(
            ', '
        )} CASCADE`;
        await client.query(tableDropQuery);
    }
};

async function runMigrations(client: Client): Promise<void> {
    let files = fs.readdirSync(MIGRATION_PATH);

    console.log(chalk.blue('INFO: ') + 'Running migrations');

    const res = await client.query(
        `SELECT id, timestamp FROM migrations ORDER BY id DESC LIMIT 1`
    );

    const lastMigration = res.rows || [];

    if (lastMigration.length > 0) {
        const lastMigrationTimestamp = Math.floor(
            lastMigration[0].timestamp.getTime() / 1000
        );
        console.log(
            chalk.blue('INFO: ') +
                'Last migration timestamp: ' +
                chalk.bold.underline(lastMigrationTimestamp)
        );

        files = files.filter((file) => {
            const fileParts = file.split('.');
            const fileTimestamp = fileParts[0];
            return Number(fileTimestamp) > lastMigrationTimestamp;
        });
    }

    if (files.length === 0) {
        console.log(chalk.blue('INFO: ') + 'No new migrations to run');
        return;
    }

    console.log(
        chalk.blue('INFO: ') +
            'Number of migrations to run: ' +
            chalk.bold.underline(files.length)
    );

    const currentDB = await client.query('SELECT current_database() AS db');
    console.log(
        chalk.blue('INFO: ') +
            'Database selected: ' +
            chalk.bold.underline(currentDB.rows[0].db)
    );
    await migrate(client, files);
    console.log(chalk.greenBright('SUCCESS: ') + 'Migrations complete');
    await client.query(`INSERT INTO migrations (status) VALUES ('success')`);

    console.log(
        chalk.greenBright('SUCCESS: ') +
            'Migrations table updated with new migrations'
    );
}

async function migrate(client: Client, files: string[]): Promise<void> {
    for (const file of files) {
        const data = fs.readFileSync(
            path.resolve(MIGRATION_PATH, file),
            'utf8'
        );
        await executeSqlFile(data, client, file);
    }
}

async function executeSqlFile(
    sqlScripts: string,
    client: Client,
    fileName: string
): Promise<void> {
    const sqlStatements = sqlScripts.split(/;\s*$/m);
    await executeStatements(sqlStatements, client);
    await client.query(`INSERT INTO migrations (status) VALUES ('success')`);

    console.log(
        chalk.greenBright('SUCCESS: ') +
            'script from file ' +
            chalk.bold.underline(fileName) +
            ' executed successfully.'
    );
}

async function executeStatements(
    sqlStatements: string[],
    client: Client
): Promise<void> {
    console.log(chalk.blue('INFO: ') + 'Executing statements');
    for (const statement of sqlStatements) {
        if (statement.trim() !== '') {
            await client.query(statement);
        }
    }
}

async function createDatabaseIfNotExists(client, databaseName) {
    try {
        // Sanitize database name (basic protection)
        const sanitizedName = databaseName.replace(/[^a-z0-9_]/gi, '');

        // Check if database exists
        const existsResult = await client.query(
            `SELECT EXISTS (SELECT FROM pg_database WHERE datname = $1)`,
            [sanitizedName]
        );

        if (!existsResult.rows[0].exists) {
            // Create the database
            await client.query(`CREATE DATABASE ${sanitizedName}`);
            console.log(`Database ${sanitizedName} created successfully`);
        } else {
            console.log(`Database ${sanitizedName} already exists`);
        }
    } catch (error) {
        console.error('Error creating database:', error);
        // Handle the error appropriately (e.g., rethrow, log, or return an error message)
    }
}

const run = (): void => {
    const connectionUrl = process.env.DATABASE_URL;
    if (!connectionUrl) {
        console.error(chalk.bgRed('No database connection URL provided'));
        return;
    }
    const client = new Client({ connectionString: connectionUrl });

    setUpDatabase(client, withReset)
        .then(() => {
            console.log(chalk.bgGreen('Database setup completed'));
        })
        .catch((err) => {
            console.error(chalk.bgRed(err));
            console.error(err.stack);
        })
        .finally(() => {
            client.end();
        });
};

run();
