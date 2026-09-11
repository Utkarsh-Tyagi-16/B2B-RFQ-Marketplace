/**
 * server.js — Entry point for the B2B RFQ Marketplace API
 * Bootstraps Express, connects to MongoDB, mounts all route groups,
 * and registers the global error handler as the very last middleware.
 */

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Load environment variables from .env file
dotenv.config();

const app = express();

// ─── Core Middleware ──────────────────────────────────────────────────────────

// Parse incoming JSON bodies
app.use(express.json());

// Parse URL-encoded bodies (for form submissions)
app.use(express.urlencoded({ extended: true }));

// HTTP request logger in development
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// CORS — allow requests from the React frontend
const clientUrl = process.env.CLIENT_URL ? process.env.CLIENT_URL.replace(/\/$/, '') : null;
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server, curl, health-checks or local dev
      if (!origin) return callback(null, true);
      if (!clientUrl || clientUrl === '*' || origin === clientUrl || origin === 'http://localhost:5173') {
        return callback(null, true);
      }
      // Fallback: reflect origin to prevent CORS blocking during deployment transitions
      return callback(null, true);
    },
    credentials: true,
  })
);

// ─── Routes ──────────────────────────────────────────────────────────────────

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/rfqs', require('./routes/rfqRoutes'));
app.use('/api/quotations', require('./routes/quotationRoutes'));

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'B2B RFQ API is running' });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
// Must be registered AFTER all routes so Express knows it's an error handler
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT} [${process.env.NODE_ENV || 'development'}]`);
  });
};

startServer();
