import express from "express";
import pool from "../utils/db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const router = express.Router();

// Admin Login
router.post("/adminlogin", (req, res) => {
  console.log("you have reached to adminlogin route");
  const sql = "SELECT * FROM admins WHERE email = ?";
  pool.query(sql, [req.body.email], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.json({ loginStatus: false, Error: "Query error" });
    }
    
    if (result.length === 0) {
      return res.json({ loginStatus: false, Error: "Wrong email or password" });
    }

    const hashedPassword = result[0].password;
    
    bcrypt.compare(req.body.password, hashedPassword, (err, isMatch) => {
      if (err) {
        console.error("Bcrypt error:", err);
        return res.json({ loginStatus: false, Error: "Authentication error" });
      }
      
      if (!isMatch) {
        return res.json({ loginStatus: false, Error: "Wrong email or password" });
      }

      // Password is correct, create token with env secret
      const token = jwt.sign(
        { role: "admin", email: result[0].email, id: result[0].Id }, 
        process.env.JWT_SECRET, 
        { expiresIn: "1d" }
      );
      
      res.cookie("token", token, { 
        httpOnly: true, 
        secure: true, 
        sameSite: "none" 
      });
      
      return res.json({ loginStatus: true });
    });
  });
});

// Logout
router.get("/logout", (req, res) => {
  res.clearCookie("token");
  return res.json({ Status: true });
});

export { router as adminRouter };