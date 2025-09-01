import express from 'express';
import pool from "../utils/db.js";
import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt';
import moment from 'moment';

const router = express.Router();

// Employee login
router.post("/employee_login", (req, res) => {
  const employeeId = req.body.employeeId;
  const sql = "SELECT * FROM employee WHERE Id = ?";

  pool.query(sql, [employeeId], (err, result) => {
    if (err) return res.json({ loginStatus: false, Error: "Query error" });

    if (result.length > 0) {
      bcrypt.compare(req.body.password, result[0].password, (err, response) => {
        if (err) return res.json({ loginStatus: false, Error: "Wrong password" });
        if (response) {
          const email = result[0].email;
          const token = jwt.sign({ role: "employee", email: email, id: result[0].Id }, "jwt_secret_key", { expiresIn: "1d" });
          res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "none" });
          return res.json({ loginStatus: true, id: result[0].Id });
        } else {
          return res.json({ loginStatus: false, Error: "Wrong password" });
        }
      });
    } else {
      return res.json({ loginStatus: false, Error: "Wrong employee ID or password" });
    }
  });
});

// Get employee ID by email
router.get('/idbyemail', (req, res) => {
  const email = req.query.email;
  const sql = "SELECT Id FROM employee WHERE email = ?";
  pool.query(sql, [email], (err, results) => {
    if (err) return res.status(500).json({ error: "Server error" });
    if (results.length === 0) return res.status(404).json({ error: "Employee not found" });
    res.json({ employeeId: results[0].Id });
  });
});

// Employee details
router.get('/detail/:id', (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM employee WHERE id = ?";
  pool.query(sql, [id], (err, result) => {
    if (err) return res.json({ Status: false });
    return res.json({ Status: true, employee: result[0] });
  });
});

// Check-in
router.post('/checkin', (req, res) => {
  const { employeeId } = req.body;
  const now = moment().format('YYYY-MM-DD HH:mm:ss');
  const today = moment().format('YYYY-MM-DD');

  const sqlEmployee = "UPDATE employee SET checkedIn = 1, checkInTime = ? WHERE Id = ?";
  pool.query(sqlEmployee, [now, employeeId], (err) => {
    if (err) return res.json({ Status: false, Error: "Employee check-in failed" });

    const sqlAttendance = `
      INSERT INTO attendance (employee_id, date, check_in_time, status)
      VALUES (?, ?, ?, 'Present')
      ON DUPLICATE KEY UPDATE check_in_time = VALUES(check_in_time), status = 'Present'
    `;
    pool.query(sqlAttendance, [employeeId, today, now], (err) => {
      if (err) return res.json({ Status: false, Error: "Attendance update failed" });
      return res.json({ Status: true, Message: "Checked in successfully" });
    });
  });
});

// Check-out
router.post('/checkout', (req, res) => {
  const { employeeId } = req.body;
  const now = moment().format('YYYY-MM-DD HH:mm:ss');
  const today = moment().format('YYYY-MM-DD');

  const sql = "UPDATE attendance SET check_out_time = ? WHERE employee_id = ? AND date = ?";
  pool.query(sql, [now, employeeId, today], (err) => {
    if (err) return res.json({ Status: false, Error: "Check-out failed" });
    return res.json({ Status: true, Message: "Checked out successfully" });
  });
});

// Attendance for a month
router.get('/attendance/:employeeId/:month', (req, res) => {
  const { employeeId, month } = req.params;
  const startDate = moment(month, 'YYYY-MM').startOf('month').format('YYYY-MM-DD');
  const endDate = moment(month, 'YYYY-MM').endOf('month').format('YYYY-MM-DD');

  const sql = `
    SELECT date, check_in_time, check_out_time, status
    FROM attendance
    WHERE employee_id = ? AND date BETWEEN ? AND ?
    ORDER BY date ASC
  `;
  pool.query(sql, [employeeId, startDate, endDate], (err, results) => {
    if (err) return res.json({ Status: false, Error: "Error fetching attendance" });
    const totalLeaves = results.filter(r => !r.check_in_time || r.status === 'Leave').length;
    return res.json({ Status: true, attendance: results, totalLeaves });
  });
});

// Logout
router.get('/logout', (req, res) => {
  res.clearCookie('token');
  return res.json({ Status: true });
});

export { router as EmployeeRouter };
