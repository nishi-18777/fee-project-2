const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_123_resumespark';

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ success: false, message: 'No authentication token, authorization denied.' });
    }

    const verified = jwt.verify(token, JWT_SECRET);
    if (!verified) {
      return res.status(401).json({ success: false, message: 'Token verification failed, authorization denied.' });
    }

    if (verified.isGuest) {
      req.user = {
        _id: 'guest_user',
        username: verified.username || 'Guest User',
        email: verified.email || 'guest@resumespark.com',
        isGuest: true
      };
      return next();
    }

    const user = await User.findById(verified.id).select('-password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found, authorization denied.' });
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = authMiddleware;
