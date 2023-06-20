import chalk from 'chalk';
import serverlessMysql from 'serverless-mysql';
import * as path from 'path';
import * as fs from 'fs';
import dotenv from 'dotenv';
dotenv.config({ override: true, path: '.env.local' });

const DATABASE_META_NAME = 'meta';
const MIGRATION_PATH = './resources/database/migrations';

// TODO: add shell script to run with parameter/flag to reset database
// TODO: add shell script to replace credentials if needed
// TODO: add better error handling

const setUpDatabase = async (
    db: serverlessMysql.ServerlessMysql,
    withReset = false
): Promise<void> => {
    console.log(chalk.blue('INFO: ') + 'Setting up database');
    const databases = await db.query<string[]>(
        `SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?`,
        [DATABASE_META_NAME]
    );
    if (withReset || databases.length === 0) {
        await initializeDatabase(db);
    } else {
        console.log(
            chalk.blue('INFO: ') +
                'Database already exists. Skipping initialization'
        );
    }
    await runMigrations(db);
};

const initializeDatabase = async (
    connHandler: serverlessMysql.ServerlessMysql
): Promise<void> => {
    await resetDatabase(connHandler);
    await connHandler.query(
        `CREATE DATABASE IF NOT EXISTS ${DATABASE_META_NAME}`
    );
    await connHandler.query(`USE ${DATABASE_META_NAME}`);
    await connHandler.query(`CREATE TABLE IF NOT EXISTS migrations (
        id INT NOT NULL AUTO_INCREMENT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(255) NOT NULL DEFAULT 'pending',
        PRIMARY KEY (id)
    )`);
};

const resetDatabase = async (
    connHandler: serverlessMysql.ServerlessMysql
): Promise<void> => {
    const databases = await connHandler.query<{ SCHEMA_NAME: string }[]>(
        `SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME NOT IN ('mysql', 'information_schema', 'performance_schema', 'sys')`
    );
    for (const database of databases) {
        console.log(
            chalk.bold(
                'Dropping database ' +
                    chalk.bold.underline(database.SCHEMA_NAME)
            )
        );
        await connHandler.query(`DROP DATABASE ${database.SCHEMA_NAME}`);
    }
};

async function runMigrations(
    db: serverlessMysql.ServerlessMysql,
    primaryDatabaseName = 'main'
): Promise<void> {
    let files = fs.readdirSync(MIGRATION_PATH);

    console.log(chalk.blue('INFO: ') + 'Running migrations');

    const lastMigration = await db.query<{ id: number; timestamp: string }[]>(
        `SELECT id, timestamp FROM ${DATABASE_META_NAME}.migrations ORDER BY id DESC LIMIT 1`
    );

    if (lastMigration.length > 0) {
        const lastMigrationTimestamp = lastMigration[0].timestamp;
        files = files.filter((file) => {
            const fileParts = file.split('.');
            const fileTimestamp = fileParts[0];
            return fileTimestamp > lastMigrationTimestamp;
        });
    }

    await db.query(`CREATE DATABASE IF NOT EXISTS ${primaryDatabaseName}`);
    await db.query(`USE ${primaryDatabaseName}`);

    const currentDB = await db.query<{ db: string }[]>(
        'SELECT DATABASE() AS db'
    );
    console.log(
        chalk.blue('INFO: ') +
            'Database selected: ' +
            chalk.bold.underline(currentDB[0].db)
    );

    await migrate(db, files);
}

async function migrate(
    db: serverlessMysql.ServerlessMysql,
    files: string[]
): Promise<void> {
    for (const file of files) {
        const data = fs.readFileSync(
            path.resolve(MIGRATION_PATH, file),
            'utf8'
        );
        await executeSqlFile(data, db, file);
    }
}

async function executeSqlFile(
    sqlScripts: string,
    db: serverlessMysql.ServerlessMysql,
    fileName: string
): Promise<void> {
    const sqlStatements = sqlScripts.split(/;\s*$/m);
    await executeStatements(sqlStatements, db);
    await db.query(
        `INSERT INTO ${DATABASE_META_NAME}.migrations (status) VALUES ('success')`
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
    db: serverlessMysql.ServerlessMysql
): Promise<void> {
    let transaction = db.transaction();

    for (const statement of sqlStatements) {
        if (statement.trim() !== '') {
            const removeDelimiter = statement
                .replace(/DELIMITER\s*\/\/\s*/g, '')
                .replace(/\/\/[\n\r\s]*DELIMITER/, '')
                .replace(/END/g, '; END');
            transaction = transaction.query(removeDelimiter);
        }
    }

    transaction.rollback((err: Error) => {
        console.log(chalk.bgRed('rollback transaction'));
        throw err;
    });

    await transaction.commit();
}

const run = (): void => {
    let db: serverlessMysql.ServerlessMysql;

    try {
        db = serverlessMysql({
            config: {
                host: process.env.DB_HOST,
                user: process.env.DB_USERNAME,
                password: process.env.DB_PASSWORD,
                port: Number(process.env.DB_PORT) || 3306,
            },
        });
    } catch (error) {
        console.log(error);
        return;
    }
    setUpDatabase(db, true)
        .then(() => {
            console.log(chalk.bgGreen('Database setup completed'));
        })
        .catch((err) => {
            console.error(chalk.bgRed(err));
        })
        .finally(() => {
            console.log('Closing connection');
            db.end();
            db.quit();
        });
};

run();
