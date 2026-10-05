const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const dns = require("dns");
const rateLimit = require("express-rate-limit");

const connectDB = require("./config/db");

const { seedDefaultPolicy } = require("./services/policySeedService");

const scanRoutes = require("./routes/scanRoutes");
const policyRoutes = require("./routes/policyRoutes");
const authRoutes = require("./routes/authRoutes");

const { errorHandler } = require("./middleware/errorMiddleware");
const { notFound } = require("./middleware/notFoundMiddleware");

// --------------------------------------------------
// Environment
// --------------------------------------------------

dotenv.config();

// --------------------------------------------------
// DNS Configuration
// --------------------------------------------------

dns.setServers([
  "1.1.1.1",
  "1.0.0.1",
]);

// --------------------------------------------------
// Express App
// --------------------------------------------------

const app = express();

const PORT = process.env.PORT || 5000;

const FRONTEND_URL =
  process.env.FRONTEND_URL || "http://localhost:3000";

// --------------------------------------------------
// Start Server
// --------------------------------------------------

const startServer = async () => {
  try {
    // ------------------------------------------------
    // Database Connection
    // ------------------------------------------------

    await connectDB();

    console.log("MongoDB connected successfully");

    // ------------------------------------------------
    // Default Privacy Policy
    // ------------------------------------------------

    await seedDefaultPolicy();

    console.log("Default privacy policy ready");

    // ------------------------------------------------
    // Security
    // ------------------------------------------------

    app.disable("x-powered-by");

    app.use(
      helmet({
        crossOriginResourcePolicy: {
          policy: "cross-origin",
        },
      })
    );

    // ------------------------------------------------
    // CORS
    // ------------------------------------------------

    app.use(
      cors({
        origin: FRONTEND_URL,
        credentials: true,
      })
    );

    // ------------------------------------------------
    // Request Logger
    // ------------------------------------------------

    app.use(
      morgan(
        process.env.NODE_ENV === "production"
          ? "combined"
          : "dev"
      )
    );

    // ------------------------------------------------
    // Body Parser
    // ------------------------------------------------

    app.use(
      express.json({
        limit: "1mb",
      })
    );

    app.use(
      express.urlencoded({
        extended: true,
        limit: "1mb",
      })
    );

    // ------------------------------------------------
    // API Rate Limiting
    // ------------------------------------------------

    const apiLimiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 300,

      standardHeaders: true,
      legacyHeaders: false,

      message: {
        success: false,
        message:
          "Too many requests. Please try again later.",
      },
    });

    app.use("/api", apiLimiter);

    // ------------------------------------------------
    // API Routes
    // ------------------------------------------------

    app.use("/api/auth", authRoutes);

    app.use("/api/scans", scanRoutes);

    app.use("/api/policies", policyRoutes);

    // ------------------------------------------------
    // Health Check
    // ------------------------------------------------

    app.get("/api/health", (req, res) => {
      return res.status(200).json({
        success: true,
        status: "healthy",
        service: "privacy-firewall-api",
        message: "Privacy Firewall API is running",
        timestamp: new Date().toISOString(),
      });
    });

    // ------------------------------------------------
    // Root Route
    // ------------------------------------------------

    app.get("/", (req, res) => {
      return res.status(200).json({
        success: true,
        service: "Privacy Firewall",
        message: "Pre-LLM Privacy Firewall API",
        version: "1.0.0",
      });
    });

    // ------------------------------------------------
    // 404 Handler
    // ------------------------------------------------

    app.use(notFound);

    // ------------------------------------------------
    // Global Error Handler
    // ------------------------------------------------

    app.use(errorHandler);

    // ------------------------------------------------
    // Start HTTP Server
    // ------------------------------------------------

    app.listen(PORT, () => {
      console.log("");
      console.log("========================================");
      console.log("      PRIVACY FIREWALL API SERVER");
      console.log("========================================");
      console.log(
        `Environment : ${
          process.env.NODE_ENV || "development"
        }`
      );
      console.log(`Port        : ${PORT}`);
      console.log(`Frontend    : ${FRONTEND_URL}`);
      console.log(
        `Health      : http://localhost:${PORT}/api/health`
      );
      console.log("========================================");
      console.log("");
    });
  } catch (error) {
    console.error("");
    console.error("========================================");
    console.error("SERVER STARTUP FAILED");
    console.error("========================================");
    console.error("Error:", error.message);
    console.error("========================================");
    console.error("");

    process.exit(1);
  }
};

// --------------------------------------------------
// Start Application
// --------------------------------------------------

startServer();