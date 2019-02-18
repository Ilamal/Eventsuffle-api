import mysql from 'mysql';

const connection = mysql.createPool({
    connectionLimit: process.env.CONNECTION_LIMIT,
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
});

export default connection;