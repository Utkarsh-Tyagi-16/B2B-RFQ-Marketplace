/**
 * controllers/authController.js — Handles user registration, login, and
 * fetching the currently authenticated user's profile.
 */

const bcrypt = require('bcryptjs');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');


// POST /api/auth/signup
// Creates a new user with a bcrypt-hashed password, returns JWT + user data.
const signup = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if a user with this email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    // Hash the password using bcrypt — saltRounds=12 is a good balance of
    // security and speed (each additional round doubles the hashing time)
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create and persist the user
    const user = await User.create({ name, email, passwordHash, role });

    // Generate a JWT encoding the new user's ID
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: { token, user },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/login
// Validates credentials and returns a fresh JWT + user data on success.
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user — select passwordHash explicitly (it's excluded from toJSON)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
    if (!user) {
      // Use a generic message to avoid user enumeration attacks
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Compare the submitted password against the stored hash
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Logged in successfully',
      data: { token, user },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/me
// Returns the currently authenticated user (extracted from JWT by authMiddleware).
const getMe = async (req, res) => {
  // req.user is populated by authMiddleware — just return it
  res.json({
    success: true,
    data: { user: req.user },
  });
};

module.exports = { signup, login, getMe };
