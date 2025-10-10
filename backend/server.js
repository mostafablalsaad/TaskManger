require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes")
const userRoutes = require("./routes/userRoutes")
const taskRoutes = require("./routes/taskRoutes")
const reportRoutes = require("./routes/reportRoutes")
const serverless = require('serverless-http');
const { console } = require("inspector");
const app = express();

console.log("URL before the process ",process.env.CLIENT_URL);

// CLIENT_ORIGINS env example:
CLIENT_ORIGINS="https://my-frontend.vercel.app,https://my-frontend-git-preview.vercel.app"
const raw = process.env.CLIENT_ORIGINS || process.env.CLIENT_URL || "";


const allowedOrigins = raw.split(',').map(s => s.trim()).filter(Boolean);

console.log("allowed origin is ",allowedOrigins);
try{
  
  let corsOptions;
  if (allowedOrigins.length === 0) {
    // If no origins configured, allow all origins but log a warning so the deployer
    // is aware. This is less secure but avoids blocking legitimate frontends while
    // the environment variable is not set.
    console.warn("WARNING: No CLIENT_ORIGINS or CLIENT_URL configured — CORS is wide open.");
    corsOptions = {
      origin: true, // reflect request origin
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
      exposedHeaders: ['Set-Cookie']
    };
  } else {
    corsOptions = {
      origin: function(origin, callback) {
        // allow requests with no origin (e.g., curl, mobile, server-to-server)
        if (!origin) return callback(null, true);
  
        if (allowedOrigins.indexOf(origin) !== -1) {
          callback(null, true);
        } else {
          // don't throw — let middleware return a CORS failure with a clear message
          callback(new Error('CORS not allowed by server'), false);
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
      exposedHeaders: ['Set-Cookie']
    };
  }
  
  // Middleware to handle CORS (ensure preflight requests are handled)
  app.options('*', cors(corsOptions)); // enable pre-flight for all routes
  app.use(cors(corsOptions));
  
  // Connect Database
  connectDB();
  
  // Middleware
  app.use(express.json());
  
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000); 
  try
  {
  
    app.get('/api/health', (req, res) => res.json({ ok: true, now: new Date().toISOString() }));
  }catch(error)
  {
    console.log("error in the health api",error)
  }
  
  
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
}catch(error){
  console.log("main code havign some errors ",error)
}


module.exports= serverless(app);