import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { adminRouter } from "./Routes/AdminRoute.js";
import { EmployeeRouter } from "./Routes/EmployeeRoutes.js";
import { TaskRouter } from "./Routes/TaskRoutes.js";

const app = express();

const allowedOrigins = ["https://ems-frontend-delta-nine.vercel.app"];

app.use(cors({
  origin: allowedOrigins,
  methods: ["GET","POST","PUT","DELETE","OPTIONS"],
  credentials: true
}));

app.use(cookieParser());
app.use(express.json());

// Routes
app.use("/auth", adminRouter);
app.use("/employee", EmployeeRouter);
app.use("/task", TaskRouter);

// Test route
app.get("/", (req, res) => res.send("Backend server is running"));

// Auth verification middleware
export const verifyUser = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.json({ Status: false, Error: "Not authenticated" });

  import("jsonwebtoken").then(Jwt => {
    Jwt.verify(token, "jwt_secret_key", (err, decoded) => {
      if (err) return res.json({ Status: false, Error: "Wrong credentials" });
      req.id = decoded.id;
      req.role = decoded.role;
      next();
    });
  });
};

// Verify route
app.get("/verify", verifyUser, (req, res) => {
  return res.json({ Status: true, role: req.role, id: req.id });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
