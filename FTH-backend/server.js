// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const session = require("express-session");
const passport = require("./src/config/passport");
// Import routes
const authRoutes = require("./src/routes/authRoutes");
const clerkRoutes = require("./src/routes/clerkRoutes");
const buyerRoutes = require("./src/routes/buyerRoutes");
const farmerRoutes = require("./src/routes/farmerRoutes");
const adminRoutes = require("./src/routes/adminRoutes");

// Import middleware
const { notFound, errorHandler } = require("./src/middleware/errorHandler");

// Import database
const db = require("./src/config/db");

// Initialize express app
const app = express();

// Security middleware
app.use(helmet());

app.use(cors());

// Body parser
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(
  session({
    secret: process.env.SESSION_SECRET || "SECRET_KEY",
    resave: false,
    saveUninitialized: true,
  })
);
app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Rate limiting
const limiter = rateLimit({
  windowMs: 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});

app.use("/api/", limiter);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/clerk", clerkRoutes);
app.use("/api/buyer", buyerRoutes);
app.use("/api/farmer", farmerRoutes);
app.use("/api/admin", adminRoutes);

// Welcome route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to Farmers Trade Hub API",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      clerk: "/api/clerk",
      buyer: "/api/buyer",
      health: "/health",
    },
  });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

// Server configuration
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";

// Start server
const server = app.listen(PORT, () => {
  console.log(`
    🚀 Server running in ${NODE_ENV} mode
    📡 Listening on port ${PORT}
    🌐 API URL: http://localhost:${PORT}
  `);
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM signal received: closing HTTP server");
  server.close(async () => {
    console.log("HTTP server closed");
    await db.close();
    process.exit(0);
  });
});

process.on("SIGINT", async () => {
  console.log("SIGINT signal received: closing HTTP server");
  server.close(async () => {
    console.log("HTTP server closed");
    await db.close();
    process.exit(0);
  });
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Promise Rejection:", err);
  server.close(async () => {
    await db.close();
    process.exit(1);
  });
});

module.exports = app;
