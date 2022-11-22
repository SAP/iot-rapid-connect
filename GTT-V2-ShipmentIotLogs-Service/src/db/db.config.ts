import * as dotenv from 'dotenv'
dotenv.config()
import pgPromise from 'pg-promise';
import Logger from '../utils/logger.config.js';

// localhost db
const conn = {
    host: 'localhost',
    port: 5432,
    database: '',
    user: 'postgres',
    password: ''
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