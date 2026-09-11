/**
 * middleware/errorHandler.js — Global Express error-handling middleware.
 *
 * This is the SINGLE place where all errors are converted to a consistent
 * JSON response shape: { success: false, message, errors? }.
 *
 * Controllers call next(error) or next(createError(statusCode, message)) and
 * this handler takes care of logging and formatting — no scattered try/catch
 * return statements needed in controllers.
 */

const errorHandler = (err, req, res, _next) => {
  // Log the full error in development for easy debugging
  if (process.env.NODE_ENV === 'development') {
    console.error('❌ Error:', err);
  }

  // Default status code and message
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || 'An unexpected server error occurred';

  // ── Mongoose Validation Error ─────────────────────────────────────────────
  // Fires when a document fails schema-level validation before save
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const errors = Object.values(err.errors).map((e) => e.message);
    return res.status(statusCode).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  // ── Mongoose Duplicate Key Error ──────────────────────────────────────────
  // Fires on unique index violations (e.g. duplicate email or duplicate quotation)
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `A record with this ${field} already exists.`;
  }

  // ── Mongoose Cast Error ───────────────────────────────────────────────────
  // Fires when an invalid ObjectId is passed as a route param
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid value for field: ${err.path}`;
  }

  // ── JWT Errors (should normally be caught in authMiddleware, but fallback) ─
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token.';
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired. Please log in again.';
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
};

module.exports = errorHandler;
