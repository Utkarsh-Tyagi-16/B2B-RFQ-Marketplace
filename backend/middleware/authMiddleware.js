/**
 * middleware/authMiddleware.js — Verifies the JWT sent by the client.
 *
 * JWT STORAGE TRADEOFF (localStorage vs httpOnly cookie):
 * ─────────────────────────────────────────────────────────────
 * We store the JWT in the Authorization header (Bearer token) sent from
 * localStorage on the frontend.
 *
 * WHY localStorage:
 *   - Simpler to implement in a SPA — no need for cookie parsing or CSRF
 *     tokens.
 *   - Works seamlessly across cross-origin frontend/backend deployments
 *     (e.g. Vercel + Render) without sameSite/secure cookie configuration.
 *
 * TRADEOFF / RISK:
 *   - localStorage is accessible by JavaScript, so an XSS attack CAN steal
 *     the token.
 *
 * MITIGATIONS applied here:
 *   - Short expiry (7d, configurable via JWT_EXPIRES_IN).
 *   - For production hardening, switch to httpOnly cookies and add CSRF
 *     protection — the backend extraction logic only needs to change in
 *     this one file and in the Axios interceptor on the frontend.
 * ─────────────────────────────────────────────────────────────
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Extracts and verifies the JWT from the Authorization header, then attaches
// the full user document to req.user for downstream controllers to use.
const authMiddleware = async (req, res, next) => {
  try {
    // Expect: "Authorization: Bearer <token>"
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided. Please log in.',
      });
    }

    const token = authHeader.split(' ')[1];

    // Verify signature and expiry; throws if invalid
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch the user from DB to ensure they still exist and get fresh data
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User belonging to this token no longer exists.',
      });
    }

    // Attach user to request — passwordHash is stripped by the model's toJSON
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired. Please log in again.' });
    }
    return res.status(401).json({ success: false, message: 'Invalid token.' });
  }
};

module.exports = authMiddleware;
