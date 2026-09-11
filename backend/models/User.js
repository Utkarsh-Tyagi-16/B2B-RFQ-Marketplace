/**
 * models/User.js — Mongoose schema and model for platform users.
 * Stores hashed passwords (never plaintext), role, and timestamps.
 */

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    // Never store plaintext passwords — this field holds the bcrypt hash
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: {
        values: ['buyer', 'supplier'],
        message: 'Role must be either "buyer" or "supplier"',
      },
      required: [true, 'Role is required'],
    },
  },
  {
    // Automatically adds createdAt and updatedAt fields
    timestamps: true,
  }
);

// Never accidentally return passwordHash in API responses
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
