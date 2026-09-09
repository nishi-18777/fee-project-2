const mongoose = require('mongoose');
const connectDB = require('../lib/db');

const dbCheckMiddleware = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }
  } catch (err) {
    console.warn('MongoDB connection notice in dbCheck:', err.message);
  }
  next();
};

module.exports = dbCheckMiddleware;

