/**
 * config/db.js — Establishes and manages the MongoDB connection via Mongoose.
 * Called once at startup; Mongoose handles reconnection automatically.
 */

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    // Exit process with failure — the app cannot function without a database
    process.exit(1);
  }
};

module.exports = connectDB;
