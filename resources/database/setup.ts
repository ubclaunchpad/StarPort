import chalk from 'chalk';
import * as path from 'path';
import * as fs from 'fs';
import dotenv from 'dotenv';
import mysql, { Connection } from 'mysql2';
console.log('Connected to PlanetScale!')
dotenv.config();

const DATABASE_META_NAME = 'meta';
const DATABASE_NAME = 'cosmic-dev';
const MIGRATION_PATH = './resources/database/migrations';

const setUpDatabase = async (
    connection: Connection,
    withReset = false
): Promise<void> => {
    console.log(chalk.blue('INFO: ') + 'Setting up database');
    const tables = await query(
        connection,
        `SHOW TABLES IN ?? LIKE ?`,
        [DATABASE_NAME, 'migrations']
    );

    if (withReset || tables.length === 0) {
        await initializeDatabase(connection);
    } else {
        console.log(
            chalk.blue('INFO: ') +
                'Migrations table already exists. Skipping initialization'
        );
    }
    await runMigrations(connection, DATABASE_NAME);
};

const initializeDatabase = async (connection: Connection): Promise<void> => {
    await resetDatabase(connection);
    await query(
        connection,
        `CREATE DATABASE IF NOT EXISTS ??`,
        [DATABASE_NAME]
    );
    await query(connection, `USE ??`, [DATABASE_NAME]);
    await query(connection, `CREATE TABLE IF NOT EXISTS migrations (
       id INT AUTO_INCREMENT PRIMARY KEY,
       timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       status VARCHAR(255) NOT NULL DEFAULT 'pending'
     )`);
};

const resetDatabase = async (connection: Connection): Promise<void> => {
    const result = await query(
        connection,
        `SHOW DATABASES WHERE \`Database\` NOT IN ('mysql', 'information_schema', 'performance_schema', 'sys')`
    );

    for (const database of result) {
        if (database.Database === DATABASE_NAME) {
            console.log(
                chalk.bold(
                    'Emptying database ' + chalk.bold.underline(database.Database)
                )
            );
            const tables = await query(connection, `SHOW TABLES IN ??`, [database.Database]);
            console.log(tables);
            for (const table of tables) {
                const tableName = Object.values(table)[0];
                await query(connection, `DROP TABLE ??`, [tableName]);
            }
        }
    }
};

async function runMigrations(
    connection: Connection,
    primaryDatabaseName = 'main'
): Promise<void> {
    let files = fs.readdirSync(MIGRATION_PATH);

    console.log(chalk.blue('INFO: ') + 'Running migrations');

    const res = await query(
        connection,
        `SELECT id, timestamp FROM migrations ORDER BY id DESC LIMIT 1`
    );

    const lastMigration = res || [];

    if (lastMigration.length > 0) {
        const lastMigrationTimestamp = lastMigration[0].timestamp;
        files = files.filter((file) => {
            const fileParts = file.split('.');
            const fileTimestamp = fileParts[0];
            return fileTimestamp > lastMigrationTimestamp;
        });
    }

    // await query(connection, `CREATE DATABASE IF NOT EXISTS ??`, [
    //     primaryDatabaseName,
    // ]);
    // await query(connection, `USE ??`, [primaryDatabaseName]);

    const currentDB = await query(connection, 'SELECT database() AS db');
    console.log(
        chalk.blue('INFO: ') +
            'Database selected: ' +
            chalk.bold.underline(currentDB[0].db)
    );
    await migrate(connection, files);
}

async function migrate(connection: Connection, files: string[]): Promise<void> {
    for (const file of files) {
        const data = fs.readFileSync(
            path.resolve(MIGRATION_PATH, file),
            'utf8'
        );
        await executeSqlFile(data, connection, file);
    }
}

async function executeSqlFile(
    sqlScripts: string,
    connection: Connection,
    fileName: string
): Promise<void> {
    const sqlStatements = sqlScripts.split(/;\s*$/m);
    await executeStatements(sqlStatements, connection);
    await query(
        connection,
        `INSERT INTO migrations (status) VALUES ('success')`
    );

    console.log(
        chalk.greenBright('SUCCESS: ') +
            'script from file ' +
            chalk.bold.underline(fileName) +
            ' executed successfully.'
    );
}

async function executeStatements(
    sqlStatements: string[],
    connection: Connection
): Promise<void> {
    console.log(chalk.blue('INFO: ') + 'Executing statements');
    for (const statement of sqlStatements) {
        if (statement.trim() !== '') {
            await query(connection, statement);
        }
    }
}

function query(connection: Connection, query: string, params?: any[]): Promise<any[]> {
    return new Promise<any[] | any>((resolve, reject) => {
        connection.query(query, params, (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
}

const run = (): void => {
    const connection = mysql.createConnection(process.env.DATABASE_URL!)
    setUpDatabase(connection, true)
    .then(() => {
        console.log(chalk.bgGreen('Database setup completed'));
    })
    .catch((err) => {
        console.error(chalk.bgRed(err));
    })
    .finally(() => {
        console.log('Closing connection');
        connection.end();
    });
};

run();