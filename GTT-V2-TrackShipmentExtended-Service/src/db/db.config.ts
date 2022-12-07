import pgPromise from 'pg-promise';
import xsenv from '@sap/xsenv';

// get db service credentials from environment variables
var dbService = xsenv.cfServiceCredentials({ tag: 'database' });

// db connection format
const conn = {
    host: dbService.hostname,
    port: dbService.port,
    database: dbService.dbname,
    user: dbService.username,
    password: dbService.password,
    ssl: {
        sslmode: 'verify-ca',
        ca: dbService.sslcert
    }
};

var initOptions = {
    error: function (error, e) {
        if (e.cn) {
            // A connection-related error;
            console.log("CN:", e.cn);
            console.log("EVENT:", error.message);
        }
    }
};

var pgp = pgPromise(initOptions);

var db = pgp(conn);

db.connect()
    .then(function (obj) {
        obj.done(); // success, release connection;
        console.log("Connected to db: ", conn.database);
    })
    .catch(function (error) {
        console.log("ERROR:", error.message);
    });

export default db