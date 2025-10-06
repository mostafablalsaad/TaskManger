require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes")
const userRoutes = require("./routes/userRoutes")
const taskRoutes = require("./routes/taskRoutes")
const reportRoutes = require("./routes/reportRoutes")

const app = express();

console.log("URL before the process ",process.env.CLIENT_URL);

// CLIENT_ORIGINS env example:
CLIENT_ORIGINS="https://my-frontend.vercel.app,https://my-frontend-git-preview.vercel.app"
const raw = process.env.CLIENT_ORIGINS || process.env.CLIENT_URL || "";

const allowedOrigins = raw.split(',').map(s => s.trim()).filter(Boolean);

const corsOptions = {
  origin: function(origin, callback) {
    // allow requests with no origin (e.g., curl, mobile, server-to-server)
    if (!origin) return callback(null, true);

    if (allowedOrigins.length === 0) {
      // No origins configured — deny by default (safer)
      return callback(new Error('CORS not allowed - no allowed origins configured'), false);
    }

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed by server'), false);
    }
  },
  credentials: true, // allow session cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Set-Cookie'] // expose Set-Cookie if needed
};

// Middleware to handle CORS
app.use(
  cors(corsOptions)
);

// Connect Database
connectDB();

// Middleware
app.use(express.json());


app.get("/helloWorld", (req, res) => {
  res.status(200).json({ message: "you are in" });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/reports", reportRoutes);

// Serve uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));