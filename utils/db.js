import mysql from "mysql2";

const pool = mysql.createPool({
  host: "turntable.proxy.rlwy.net",
  port: 34639,
  user: "root",
  password: "fildFMUpDWUToKxvNgGXktXxfcHXTuWq",
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