import express from 'express';
import pool from '../utils/db.js';

const router = express.Router();

// Assign task
router.post('/assign', (req, res) => {
  const { employee_id, title, description, due_date } = req.body;
  const sql = "INSERT INTO tasks (employee_id, title, description, due_date) VALUES (?, ?, ?, ?)";
  pool.query(sql, [Number(employee_id), title, description, due_date], (err, result) => {
    if (err) return res.json({ Status: false, Error: "Task assignment failed" });
    return res.json({ Status: true, Message: "Task assigned successfully" });
  });
});

// Get all tasks (admin)
router.get('/all', (req, res) => {
  const sql = `SELECT tasks.*, employee.name as employee_name FROM tasks JOIN employee ON tasks.employee_id = employee.id`;
  pool.query(sql, (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query error" });
    return res.json({ Status: true, Result: result });
  });
});

// Tasks for a specific employee
router.get('/employee/:id', (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM tasks WHERE employee_id = ?";
  pool.query(sql, [id], (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query error" });
    return res.json({ Status: true, Result: result });
  });
});

// Update task status
router.put('/updateStatus/:id', (req, res) => {
  const taskId = req.params.id;
  const newStatus = req.body.status;
  const query = "UPDATE tasks SET status = ? WHERE Id = ?";
  pool.query(query, [newStatus, taskId], (err, result) => {
    if (err) return res.json({ Status: false, Error: err.message });
    res.json({ Status: true, Message: "Task status updated" });
  });
});

export { router as TaskRouter };
