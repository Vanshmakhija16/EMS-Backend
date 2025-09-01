import express from 'express';
import pool from "../utils/db.js";
import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt';
import moment from 'moment';

const router = express.Router();

// ===== Employee Login =====
router.post("/employee_login", async (req, res) => {
  const { employeeId, password } = req.body;

  if (!employeeId || !password) {
    return res.json({ loginStatus: false, Error: "Employee ID and password are required" });
  }

  try {
    const sql = "SELECT * FROM employee WHERE Id = ?";
    pool.query(sql, [employeeId], async (err, result) => {
      if (err) return res.json({ loginStatus: false, Error: "Query error" });

      if (result.length === 0) return res.json({ loginStatus: false, Error: "Wrong employee ID or password" });

      const match = await bcrypt.compare(password, result[0].password);
      if (!match) return res.json({ loginStatus: false, Error: "Wrong employee ID or password" });

      const token = jwt.sign(
        { role: "employee", email: result[0].email, id: result[0].Id },
        "jwt_secret_key",
        { expiresIn: "1d" }
      );

      res.cookie("token", token, {
        httpOnly: true,
        secure: true,       // required if using HTTPS (Vercel)
        sameSite: "none"    // allows cross-site cookie
      });

      return res.json({ loginStatus: true, id: result[0].Id });
    });
  } catch (error) {
    return res.json({ loginStatus: false, Error: error.message });
  }
});

// ===== Get Employee ID by Email =====
router.get('/idbyemail', (req, res) => {
  const email = req.query.email;
  if (!email) return res.status(400).json({ error: "Email is required" });

  const sql = "SELECT Id FROM employee WHERE email = ?";
  pool.query(sql, [email], (err, results) => {
    if (err) return res.status(500).json({ error: "Server error" });
    if (results.length === 0) return res.status(404).json({ error: "Employee not found" });
    res.json({ employeeId: results[0].Id });
  });
});

// ===== Get Employee Details =====
router.get('/detail/:id', (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM employee WHERE Id = ?";
  pool.query(sql, [id], (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query error" });
    return res.json({ Status: true, employee: result[0] });
  });
});

// ===== Employee Check-in =====
router.post('/checkin', (req, res) => {
  const { employeeId } = req.body;
  if (!employeeId) return res.json({ Status: false, Error: "Employee ID is required" });

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
      if (err) return res.json({ Status: false, Error: "Attendance insert failed" });
      return res.json({ Status: true, Message: "Checked in successfully" });
    });
  });
});

// ===== Employee Check-out =====
router.post('/checkout', (req, res) => {
  const { employeeId } = req.body;
  if (!employeeId) return res.json({ Status: false, Error: "Employee ID is required" });

  const now = moment().format('YYYY-MM-DD HH:mm:ss');
  const today = moment().format('YYYY-MM-DD');

  const sql = "UPDATE attendance SET check_out_time = ? WHERE employee_id = ? AND date = ?";
  pool.query(sql, [now, employeeId, today], (err) => {
    if (err) return res.json({ Status: false, Error: "Check-out failed" });
    return res.json({ Status: true, Message: "Checked out successfully" });
  });
});

// ===== Employee Attendance History =====
router.get('/attendance/:employeeId/:month', (req, res) => {
  const { employeeId, month } = req.params;
  if (!employeeId || !month) return res.json({ Status: false, Error: "Employee ID and month are required" });

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

// ===== Employee Logout =====
router.get('/logout', (req, res) => {
  res.clearCookie('token', { httpOnly: true, secure: true, sameSite: 'none' });
  return res.json({ Status: true, Message: "Logged out successfully" });
});

export { router as EmployeeRouter };
