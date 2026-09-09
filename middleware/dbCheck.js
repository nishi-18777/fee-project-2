const mongoose = require('mongoose');
const connectDB = require('../lib/db');

const dbCheckMiddleware = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }
    next();
  } catch (err) {
    console.error('Database connection error in dbCheck middleware:', err.message);

    const isCloud =
      process.env.VERCEL ||
      process.env.RENDER ||
      process.env.NODE_ENV === 'production';

    return res.status(503).json({
      success: false,
      message: isCloud
        ? 'Database connection failed. Please ensure MONGODB_URI is configured with a valid MongoDB Atlas connection string in your deployment settings.'
        : 'Database is not connected. Please make sure MongoDB is running on your machine.'
    });
  }
};

module.exports = dbCheckMiddleware;

