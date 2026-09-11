/**
 * utils/generateToken.js — Creates a signed JWT for a given user ID.
 * The secret and expiry are pulled from environment variables so they
 * are never hardcoded in the codebase.
 */

const jwt = require('jsonwebtoken');

// Returns a signed JWT string encoding the user's MongoDB _id
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

module.exports = generateToken;
