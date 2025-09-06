// filepath: /workspaces/EMS-Backend/utils/db.js
import mysql from 'mysql2';

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

pool.getConnection((err, connection) => {
    if (err) {
        console.log("Connection error", err);
    } else {
        console.log("Connected");
        connection.release();
    }
});

export default pool;