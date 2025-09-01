import express from 'express';
import pool from '../utils/db.js';

const router = express.Router();

// ===== Assign a Task to an Employee =====
router.post('/assign', (req, res) => {
  const { employee_id, title, description, due_date } = req.body;

  if (!employee_id || !title || !description || !due_date) {
    return res.json({ Status: false, Error: "All fields are required" });
  }

  const sql = "INSERT INTO tasks (employee_id, title, description, due_date) VALUES (?, ?, ?, ?)";
  pool.query(sql, [Number(employee_id), title, description, due_date], (err, result) => {
    if (err) {
      console.error('Task assignment error:', err);
      return res.json({ Status: false, Error: "Task assignment failed" });
    }
    return res.json({ Status: true, Message: "Task assigned successfully" });
  });
});

// ===== Get All Tasks for Admin =====
router.get('/all', (req, res) => {
  const sql = `
    SELECT tasks.*, employee.name AS employee_name
    FROM tasks
    JOIN employee ON tasks.employee_id = employee.id
  `;
  pool.query(sql, (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query error" });
    return res.json({ Status: true, Result: result });
  });
});

// ===== Get Tasks for a Specific Employee =====
router.get('/employee/:id', (req, res) => {
  const { id } = req.params;

  if (!id) return res.json({ Status: false, Error: "Employee ID is required" });

  const sql = "SELECT * FROM tasks WHERE employee_id = ?";
  pool.query(sql, [id], (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query error" });
    return res.json({ Status: true, Result: result });
  });
});

// ===== Update Task Status =====
router.put('/updateStatus/:id', (req, res) => {
  const taskId = req.params.id;
  const newStatus = req.body.status;

  if (!newStatus) return res.json({ Status: false, Error: "Status is required" });

  const sql = "UPDATE tasks SET status = ? WHERE Id = ?";
  pool.query(sql, [newStatus, taskId], (err, result) => {
    if (err) return res.json({ Status: false, Error: err.message });
    return res.json({ Status: true, Message: "Task status updated" });
  });
});

export { router as TaskRouter };
