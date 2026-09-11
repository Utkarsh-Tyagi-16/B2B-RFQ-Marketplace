/**
 * middleware/validate.js — Runs express-validator checks and short-circuits
 * the request with a 400 if any validation rule failed.
 * Import this alongside your validation rule arrays in routes.
 *
 * Usage:
 *   const { body } = require('express-validator');
 *   const validate = require('../middleware/validate');
 *
 *   router.post('/signup',
 *     [body('email').isEmail(), body('password').isLength({ min: 6 })],
 *     validate,
 *     authController.signup
 *   );
 */

const { validationResult } = require('express-validator');

// Collects express-validator errors and returns a 400 with all messages
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => e.msg),
    });
  }
  next();
};

module.exports = validate;
