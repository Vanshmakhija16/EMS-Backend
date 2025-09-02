import mysql from 'mysql2'

const pool = mysql.createPool({
    host: "mysql.railway.internal",
    user: "root",
    password: "fildFMUpDWUToKxvNgGXktXxfcHXTuWq",
    database: "railway",
    connectionLimit: 10
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