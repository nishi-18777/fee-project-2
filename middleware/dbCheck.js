const mongoose = require('mongoose');

const dbCheckMiddleware = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: 'Database is not connected. Please make sure MongoDB is running on your machine.'
    });
  }
  next();
};

module.exports = dbCheckMiddleware;
