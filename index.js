import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { adminRouter } from "./Routes/AdminRoute.js";
import { EmployeeRouter } from "./Routes/EmployeeRoutes.js";
import { TaskRouter } from "./Routes/TaskRoutes.js";

console.log("🚀 Starting server...");

// ===== Load env variables =====
dotenv.config();

const app = express();

// ===== CORS Setup =====
const allowedOrigins = [
  "https://ems-frontend-delta-nine.vercel.app",
  "http://localhost:5173"
];

app.use(cors({
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true
}));

// Preflight requests
app.options("*", cors());

// ===== Middleware =====
app.use(cookieParser());
app.use(express.json());


// ===== Routes =====
app.use("/auth", adminRouter);
app.use("/employee", EmployeeRouter);
app.use("/task", TaskRouter);

// ===== Test route =====
app.get("/", (req, res) => res.send("✅ Backend server is running"));

// ===== JWT Verification Middleware =====
export const verifyUser = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.json({ Status: false, Error: "Not authenticated" });

// ...existing code...
  import("jsonwebtoken").then(Jwt => {
    Jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) return res.json({ Status: false, Error: "Wrong credentials" });
      req.id = decoded.id;
      req.role = decoded.role;
      next();
    });
  });

};

// ===== Verify token route =====
app.get("/verify", verifyUser, (req, res) => {
  return res.json({ Status: true, role: req.role, id: req.id });
});

app.use((err, req, res, next) => {
  console.error("❌ Uncaught error:", err);
  res.status(500).json({ error: "Internal server error" });
});
// ===== Start server =====
const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
