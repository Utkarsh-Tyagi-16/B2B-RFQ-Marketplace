/**
 * routes/authRoutes.js — Maps auth HTTP endpoints to controller functions.
 * Includes express-validator rules before each route handler.
 */

const express = require('express');
const { body } = require('express-validator');
const { signup, login, getMe } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');

const router = express.Router();

// ── POST /api/auth/signup ──────────────────────────────────────────────────
router.post(
  '/signup',
  [
    body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('role')
      .isIn(['buyer', 'supplier'])
      .withMessage('Role must be "buyer" or "supplier"'),
  ],
  validate,
  signup
);

// ── POST /api/auth/login ──────────────────────────────────────────────────
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  login
);

// ── GET /api/auth/me ───────────────────────────────────────────────────────
// Protected — requires a valid JWT
router.get('/me', authMiddleware, getMe);

module.exports = router;
