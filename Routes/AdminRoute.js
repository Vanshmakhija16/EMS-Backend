import express from "express";
import pool from "../utils/db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const router = express.Router();

// Admin Signup
router.post("/adminsignup", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.json({ Status: false, Error: "Email and password are required" });

  const checkSql = "SELECT * FROM admins WHERE email = ?";
  pool.query(checkSql, [email], (err, result) => {
    if (err) return res.json({ Status: false, Error: "Database query error" });
    if (result.length > 0) return res.json({ Status: false, Error: "Email already registered" });

    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) return res.json({ Status: false, Error: "Failed to encrypt password" });

      const insertSql = "INSERT INTO admins (email, password) VALUES (?, ?)";
      pool.query(insertSql, [email, hashedPassword], (err, result) => {
        if (err) return res.json({ Status: false, Error: "Database insert error" });
        return res.json({ Status: true, Message: "Admin registered successfully" });
      });
    });
  });
});

// Admin Login
router.post("/adminlogin", (req, res) => {
  const sql = "SELECT * FROM admins WHERE email = ?";
  pool.query(sql, [req.body.email], (err, result) => {
    if (err) return res.json({ loginStatus: false, Error: "Query error" });
    if (result.length === 0) return res.json({ loginStatus: false, Error: "Wrong email or password" });

    const hashedPassword = result[0].password;
    if (req.body.password !== hashedPassword) return res.json({ loginStatus: false, Error: "Wrong email or password" });

    const token = jwt.sign({ role: "admin", email: result[0].email, id: result[0].Id }, "jwt_secret_key", { expiresIn: "1d" });

    res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "none" });
    return res.json({ loginStatus: true });
  });
});

// Logout
router.get("/logout", (req, res) => {
  res.clearCookie("token");
  return res.json({ Status: true });
});

export { router as adminRouter };
