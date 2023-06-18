import * as path from 'path';
import * as fs from 'fs';
import * as serverlessMysql from 'serverless-mysql';

const db = serverlessMysql({
    config: {
        host: '',
        user: '',
        password: '',
    }});

const dbName = 'tes2'; // TODO: Change this to your database name
// TODO: export migration as function
// TODO: add option to drop database
// TODO: add date option to migration files

db.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`)
  .then(() => {
    console.log('Database created');
    return migrate(dbName);
  })
  .then(() => {
    console.log('Migration completed');
  })
  .catch((err) => {
    console.error('Error:', err);
    console.log('Closing connection');
    db.end();
  }).finally(() => {
    console.log('Closing connection');
    db.quit();
});

function migrate(dbName): Promise<void> {
    const db2 = serverlessMysql({
      config: {
        host: '',
        user: '',
        password: '',
        database: dbName,
      },
    });
  
    const files = fs.readdirSync(path.resolve(__dirname, './migrations'));
  
    const promises = files.map((file) => {
      const data = fs.readFileSync(
        path.resolve(__dirname, './migrations/', file),
        'utf8'
      );
      return executeSqlFile(data, db2);
    });
  
    return Promise.all(promises)
      .then(() => {
        console.log('All files executed successfully');
        db2.end();
        db2.quit();
      })
      .catch((err) => {
        console.error('Error executing files:', err);
        db2.end();
      }).finally(() => {
        db2.quit();
      });
  }

function executeSqlFile(sqlScripts: string, db2): Promise<void> {
    const sqlStatements = sqlScripts.split(/;\s*$/m);
    return new Promise<void>((resolve, reject) => {
        executeStatements(sqlStatements, db2).then(() => {
            console.log("done file");
            resolve();
        }).catch((err) => {
            reject(err);
        }   );
    });
}


function executeStatements(sqlStatements, db2): Promise<void> {
    return new Promise<void>((resolve, reject) => {

    let transaction = db2.transaction();
    console.log("start transaction");

    for (const statement of sqlStatements) {
        if (statement.trim() !== '') {
            if (statement.includes("DELIMITER //"))
            console.log(statement);
          
            if (statement.includes("DELIMITER //"))
            console.log("execute statewfnwelknwelnweljgnwlment");
                const removeDelimiter = statement.replace(/DELIMITER\s*\/\/\s*/g, '').replace(/\/\/[\n\r\s]*DELIMITER/, '').replace(/END/g, '; END');

                if (statement.includes("DELIMITER //"))
                console.log(removeDelimiter);
                transaction = transaction.query(removeDelimiter);           
        }
    }

    transaction.rollback((err) => {
        console.log("rollback transaction");
        console.log(err);
        reject(err);
    });

    transaction.commit().then(() => {
        console.log("commit transaction");
        resolve();
    }
    ).catch((err) => {
        console.log(err);
        reject(err);
    }
    ).finally(() => {
        db2.end();
    });

  });
}