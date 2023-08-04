import chalk from 'chalk';
import * as path from 'path';
import * as fs from 'fs';
import { Client, Pool } from 'pg';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import dotenv from 'dotenv';
dotenv.config();

const DATABASE_META_NAME = 'meta';
const MIGRATION_PATH = './resources/database/migrations';

// TODO: add shell script to run with parameter/flag to reset database
// TODO: add shell script to replace credentials if needed
// TODO: add better error handling

const setUpDatabase = async (
    client: Client,
    withReset = false
): Promise<void> => {
    console.log(chalk.blue('INFO: ') + 'Setting up database');
    const databases = (await client.query(
        `SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = $1`,
        [DATABASE_META_NAME]
    )) as { rows: string[] };

    if (withReset || databases.rows.length === 0) {
        await initializeDatabase(client);
    } else {
        console.log(
            chalk.blue('INFO: ') +
                'Database already exists. Skipping initialization'
        );
    }
    await runMigrations(client);
};

const initializeDatabase = async (connHandler): Promise<void> => {
    await resetDatabase(connHandler);
    await connHandler.query(
        `CREATE DATABASE IF NOT EXISTS ${DATABASE_META_NAME}`
    );
    await connHandler.query(`USE ${DATABASE_META_NAME}`);
    await connHandler.query(`CREATE TABLE IF NOT EXISTS migrations (
       id SERIAL NOT NULL,
       timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       status VARCHAR(255) NOT NULL DEFAULT 'pending',
       PRIMARY KEY (id)
     )`);
};

const resetDatabase = async (connHandler): Promise<void> => {
    const result = (await connHandler.query(
        `SELECT datname FROM pg_database WHERE datname NOT IN ('postgres', 'system', 'migrations', 'admin')`
    )) as { rows: { datname: string }[] };

    const databases = result.rows || [];

    for (const database of databases) {
        console.log(
            chalk.bold(
                'Dropping database ' + chalk.bold.underline(database.datname)
            )
        );
        await connHandler.query(`DROP DATABASE ${database.datname}`);
    }
};

async function runMigrations(
    client,
    primaryDatabaseName = 'main'
): Promise<void> {
    let files = fs.readdirSync(MIGRATION_PATH);

    console.log(chalk.blue('INFO: ') + 'Running migrations');

    const res = (await client.query(
        `SELECT id, timestamp FROM ${DATABASE_META_NAME}.migrations ORDER BY id DESC LIMIT 1`
    )) as { rows: { id: number; timestamp: string }[] };

    const lastMigration = res.rows || [];

    if (lastMigration.length > 0) {
        const lastMigrationTimestamp = lastMigration[0].timestamp;
        files = files.filter((file) => {
            const fileParts = file.split('.');
            const fileTimestamp = fileParts[0];
            return fileTimestamp > lastMigrationTimestamp;
        });
    }

    await client.query(`CREATE DATABASE IF NOT EXISTS ${primaryDatabaseName}`);
    await client.query(`USE ${primaryDatabaseName}`);

    const currentDB =
        (
            (await client.query('SELECT current_database() AS db')) as {
                rows: { db: string }[];
            }
        ).rows || [];
    console.log(
        chalk.blue('INFO: ') +
            'Database selected: ' +
            chalk.bold.underline(currentDB[0].db)
    );
    await migrate(client, files);
}

async function migrate(client, files: string[]): Promise<void> {
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
    client,
    fileName: string
): Promise<void> {
    const sqlStatements = sqlScripts.split(/;\s*$/m);
    await executeStatements(sqlStatements);
    await client.query(
        `INSERT INTO ${DATABASE_META_NAME}.migrations (status) VALUES ('success')`
    );

    console.log(
        chalk.greenBright('SUCCESS: ') +
            'script from file ' +
            chalk.bold.underline(fileName) +
            ' executed successfully.'
    );
}

async function executeStatements(sqlStatements: string[]): Promise<void> {
    console.log(chalk.blue('INFO: ') + 'Executing statements');
    const pool = new Pool({
        connectionString: process.env.MAIN_DATABASE_URL,
    });
    const client = await pool.connect();

    try {
        await client.query('BEGIN');
        console.log(chalk.blue('INFO: ') + 'Transaction started');
        for (const statement of sqlStatements) {
            if (statement.trim() !== '') {
                const removeDelimiter = statement
                    .replace(/DELIMITER\s*\/\/\s*/g, '')
                    .replace(/\/\/[\n\r\s]*DELIMITER/, '')
                    .replace(/END/g, '; END');
                await client.query(removeDelimiter);
            }
        }
        await client.query('COMMIT');
    } catch (err) {
        await client.query('ROLLBACK');
        console.log(chalk.bgRed('rollback transaction'));
        throw err;
    } finally {
        client.release();
        client.end();
    }
}

const run = (): void => {
    let client;
    try {
        client = new Client(process.env.DATABASE_URL);
        // inline promise wait for client to connect
        (async () => {
            await client.connect();
        })();
    } catch (error) {
        console.log(error);
        return;
    }
    setUpDatabase(client, true)
        .then(() => {
            console.log(chalk.bgGreen('Database setup completed'));
        })
        .catch((err) => {
            console.error(chalk.bgRed(err));
        })
        .finally(() => {
            console.log('Closing connection');
            client.end();
        });
};

run();
