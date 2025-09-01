import express from "express";
import pool from "../utils/db.js";
import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt'
import multer from "multer";
import path from "path";

const router = express.Router();

router.get('/', (req, res) => {
  res.send('Backend server is running');
});

router.post("/adminlogin", (req, res) => {
  const sql = "SELECT * FROM admins WHERE email = ?";
  pool.query(sql, [req.body.email], (err, result) => {
    if (err) {
      console.error("SQL Query Error in /adminlogin:", err);
      return res.json({ loginStatus: false, Error: "Query error Login failed" });
    }
    if (result.length > 0) {
      const password = result[0].password;
      if(req.body.password !== password) {
        return res.json({ loginStatus: false, Error: "Wrong email or password" });
      }
      const email = result[0].email;
      const token = jwt.sign(
        { role: "admin", email: email, id: result[0].Id },
        "jwt_secret_key",
        { expiresIn: "1d" }
      );
      res.cookie('token', token);
      return res.json({ loginStatus: true });
    } else {
      return res.json({ loginStatus: false, Error: "Wrong email or password" });
    }
  });
});

router.get('/category', (req, res) => {
  const sql = "SELECT * FROM category";
  pool.query(sql, (err, result) => {
    if(err) return res.json({Status: false, Error: "Query Error"})
    return res.json({Status: true, Result: result})
  });
});

router.post('/add_category', (req, res) => {
  const sql = "INSERT INTO category (`name`) VALUES (?)";
  pool.query(sql, [req.body.name], (err, result) => {
    if(err) return res.json({Status: false, Error: "Query Error"});
    return res.json({Status: true});
  });
});

router.post('/add_employee', (req, res) => {
  const { name, email, password, address, salary, category_id } = req.body;

  if (!name || !email || !password || !address || !salary || !category_id) {
    return res.status(400).json({ Status: false, Error: "All fields are required" });
  }

  const numericSalary = Number(salary);
  const numericCategoryId = Number(category_id);

  if (isNaN(numericSalary) || isNaN(numericCategoryId)) {
    return res.status(400).json({ Status: false, Error: "Salary and Category ID must be numbers" });
  }

  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      console.error("Hashing error:", err);
      return res.status(500).json({ Status: false, Error: "Password hashing failed" });
    }

    const sql = `
      INSERT INTO employee 
      (name, email, password, address, salary, category_id) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const values = [name, email, hashedPassword, address, numericSalary, numericCategoryId];

    pool.query(sql, values, (err, result) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ Status: false, Error: err });
      }

      return res.status(200).json({ Status: true, Message: "Employee added successfully" });
    });
  });
});

router.get('/employee', (req, res) => {
  const sql = "SELECT * FROM employee";
  pool.query(sql, (err, result) => {
    if(err) return res.json({Status: false, Error: "Query Error"});
    return res.json({Status: true, Result: result});
  });
});

router.get('/employee/:id', (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM employee WHERE id = ?";
  pool.query(sql,[id], (err, result) => {
    if(err) return res.json({Status: false, Error: "Query Error"});
    return res.json({Status: true, Result: result});
  });
});

router.put('/edit_employee/:id', (req, res) => {
  const id = req.params.id;
  const sql = `UPDATE employee 
    SET name = ?, email = ?, salary = ?, address = ?, category_id = ? 
    WHERE Id = ?`;
  const values = [
    req.body.name,
    req.body.email,
    req.body.salary,
    req.body.address,
    req.body.category_id
  ];
  pool.query(sql,[...values, id], (err, result) => {
    if(err) return res.json({Status: false, Error: "Query Error"+err});
    return res.json({Status: true, Result: result});
  });
});

router.delete('/delete_employee/:id', (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM employee WHERE id = ?";
  pool.query(sql,[id], (err, result) => {
    if(err) return res.json({Status: false, Error: "Query Error"+err});
    return res.json({Status: true, Result: result});
  });
});

router.get('/admin_count', (req, res) => {
  const sql = "SELECT COUNT(id) AS admin FROM admins";
  pool.query(sql, (err, result) => {
    if(err) return res.json({Status: false, Error: "Query Error"+err});
    return res.json({Status: true, Result: result});
  });
});

router.get('/employee_count', (req, res) => {
  const sql = "SELECT COUNT(id) AS employee FROM employee";
  pool.query(sql, (err, result) => {
    if(err) return res.json({Status: false, Error: "Query Error"+err});
    return res.json({Status: true, Result: result});
  });
});

router.get('/salary_count', (req, res) => {
  const sql = "SELECT SUM(salary) AS salaryOFEmp FROM employee";
  pool.query(sql, (err, result) => {
    if(err) return res.json({Status: false, Error: "Query Error"+err});
    return res.json({Status: true, Result: result});
  });
});

router.get('/admin_records', (req, res) => {
  const sql = "SELECT * FROM admins";
  pool.query(sql, (err, result) => {
    if(err) return res.json({Status: false, Error: "Query Error"+err});
    return res.json({Status: true, Result: result});
  });
});

router.get('/logout', (req, res) => {
  res.clearCookie('token');
  return res.json({Status: true});
});

export { router as adminRouter };
