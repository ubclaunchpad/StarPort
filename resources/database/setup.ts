import chalk from 'chalk';
import serverlessMysql from 'serverless-mysql';
import * as path from 'path';
import * as fs from 'fs';
// import dotenv from 'dotenv';
// dotenv.config({"override": true, "path": ".env.local"});

const DATABASE_META_NAME = 'meta';
const db = serverlessMysql({
    config: {
        host: '', //process.env.DB_HOST,
        user: '', //process.env.DB_USERNAME,
        password: '', //process.env.DB_PASSWORD,
        port: 3306, //process.env.DB_PORT,
    },
});

const setUpDatabase = async (withReset = false): Promise<void> => {
    console.log(chalk.blue('Setting up database'));
    const databases = await db.query<string[]>(
        `SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?`,
        [DATABASE_META_NAME]
    );
    if (withReset || databases.length === 0) {
        await initializeDatabase(db);
    } else {
        console.log(
            chalk.underline('Database is already set up. will run migrations')
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
        console.log(`Dropping database ${database.SCHEMA_NAME}`);
        await connHandler.query(`DROP DATABASE ${database.SCHEMA_NAME}`);
    }
};

async function runMigrations(
    db: serverlessMysql.ServerlessMysql,
    primaryDatabaseName = 'main'
): Promise<void> {
    await db.query(`CREATE DATABASE IF NOT EXISTS ${primaryDatabaseName}`);
    await db.query(`USE ${primaryDatabaseName}`);
    console.log('Database created');
    return migrate(db);
}

function migrate(db: serverlessMysql.ServerlessMysql): Promise<void> {
    const MIGRATION_PATH = "./resources/database/migrations";
    const files = fs.readdirSync(MIGRATION_PATH);

    const promises = files.map((file) => {
        const data = fs.readFileSync(
            path.resolve(MIGRATION_PATH, file),
            'utf8'
        );
        return executeSqlFile(data, db);
    });

    return Promise.all(promises)
        .then(() => {
            console.log(chalk.underline('All files executed successfully'));
        })
        .catch((err) => {
            console.error('Error executing files:', err);
        });
}

function executeSqlFile(
    sqlScripts: string,
    db: serverlessMysql.ServerlessMysql
): Promise<void> {
    const sqlStatements = sqlScripts.split(/;\s*$/m);
    return new Promise<void>((resolve, reject) => {
        executeStatements(sqlStatements, db)
            .then(() => {
                console.log('done file');
                resolve();
            })
            .catch((err) => {
                reject(err);
            });
    });
}

function executeStatements(
    sqlStatements: string[],
    db: serverlessMysql.ServerlessMysql
): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        let transaction = db.transaction();
        console.log('start transaction');

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
            console.log(err);
            reject(err);
        });

        transaction
            .commit()
            .then(() => {
                console.log('commit transaction');
                resolve();
            })
            .catch((err: Error) => {
                console.log(err);
                reject(err);
            });
    });
}

const run = (): void => {
    setUpDatabase(true)
        .then(() => {
            console.log(chalk.bgGreen('Database setup completed'));
        })
        .catch((err) => {
            console.error(chalk.bgRed('Error  |') + err);
        })
        .finally(() => {
            console.log('Closing connection');
            db.end();
            db.quit();
        });
};

run();
