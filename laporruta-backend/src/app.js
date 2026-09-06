const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");

const routes = require("./routes");
const errorHandler = require("./middlewares/errorHandler");
const ResponseHelper = require("./utils/responseHelper");
const { query } = require("./config/database");
const HTTP_STATUS = require("./constants/httpStatus");
const app = express();

app.use((req, res, next) => {
  console.log("[REQUEST]", req.method, req.originalUrl);
  console.log("[ORIGIN]", req.headers.origin);
  next();
});

// Deklarasikan daftar origin yang diizinkan
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173", // Port default Vite (sesuaikan jika perlu)
  process.env.FRONTEND_URL, // Tambahkan dari .env jika ada
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Izinkan request tanpa origin (seperti Postman, Curl, Mobile)
      // ATAU jika origin terdaftar di allowedOrigins
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Diblokir oleh aturan CORS"));
      }
    },
    credentials: true, // Wajib bernilai true untuk izinkan cookie
  }),
);

// Rate Limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    code: 429,
    message: "Terlalu banyak permintaan, silakan coba lagi nanti.",
    error: null,
  },
});
app.use("/api/", limiter);

// Body Parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Logging
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// Health Check
app.get("/health", async (req, res) => {
  try {
    const pgResult = await query("SELECT NOW() as time");
    res.json({
      code: 200,
      message: "successfully",
      result: {
        status: "healthy",
        database: { connected: true, time: pgResult.rows[0].time },
        supabase: { configured: !!process.env.SUPABASE_URL },
        environment: process.env.NODE_ENV || "development",
      },
    });
  } catch (error) {
    res.status(503).json({
      code: 503,
      message: "Service unavailable",
      error: error.message,
    });
  }
});

// API Routes
// Semua routes di-mount di /api/v1
app.use("/api/v1", routes);

// 404 Handler
// Format sesuai API Contract: { code, message, error }
app.use((req, res) => {
  ResponseHelper.error(
    res,
    "Route tidak ditemukan",
    HTTP_STATUS.NOT_FOUND,
    `${req.method} ${req.originalPath || req.path} tidak tersedia`,
  );
});

// Global Error Handler
// Harus dipasang SETELAH semua routes dan 404 handler
app.use(errorHandler);

module.exports = app;
