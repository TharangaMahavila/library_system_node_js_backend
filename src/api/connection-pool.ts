import crypto = require('crypto');
import mysql = require('mysql');
import config = require('../../config/default.js');
export const pool = mysql.createPool({
    connectionLimit: 10,
    host: `${config.url}`,
    user: `${config.username}`,
    password: `${config.password}`,
    database: `${config.database}`
});
console.log('Creating Database connection pool');

const password = '12345';
const hash = crypto.createHmac('sha256',password)
    .update('This Application is belonging to MR.K.P.T.Mahavila')
    .digest('hex');
console.log(hash);

console.log((hash === '617c437600fd562ec1a38b241fba6bd658a5fe0ac79e655545bf10bb88ab2c29'));

