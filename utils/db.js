import mysql from 'mysql2'

import mysql from "mysql2";

const pool = mysql.createPool({
  host: "turntable.proxy.rlwy.net", // Railway public host
  port: 34639,                       // Railway MySQL port
  user: "root",                       // From Railway
  password: "fildFMUpDWUToKxvNgGXktXxfcHXTuWq", // From Railway
  database: "railway"
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