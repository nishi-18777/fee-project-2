javascript
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

const JWT_SECRET =
  process.env.JWT_SECRET || 'super_secret_jwt_key_123_resumespark';


// ========================================
// SIGN UP
// ========================================
router.post('/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validate required fields
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please enter all required fields.'
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    const normalizedUsername = username.trim().toLowerCase();
    const normalizedEmail = email.trim().toLowerCase();

    // Check existing email
    const existingEmail = await User.findOne({
      email: normalizedEmail
    });

    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists.'
      });
    }

    // Check existing username
    const existingUsername = await User.findOne({
      username: normalizedUsername
    });

    if (existingUsername) {
      return res.status(400).json({
        success: false,
        message: 'This username is already taken.'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const newUser = new User({
      username: normalizedUsername,
      email: normalizedEmail,
      password: passwordHash
    });

    const savedUser = await newUser.save();

    // Create JWT
    const token = jwt.sign(
      {
        id: savedUser._id
      },
      JWT_SECRET,
      {
        expiresIn: '1d'
      }
    );

    // Set authentication cookie
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/'
    });

    return res.status(201).json({
      success: true,
      user: {
        id: savedUser._id,
        username: savedUser.username,
        email: savedUser.email
      }
    });

  } catch (err) {
    console.error('Signup error:', err);

    return res.status(500).json({
      success: false,
      message: 'Server error during signup.'
    });
  }
});


// ========================================
// LOGIN
// ========================================
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate fields
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please enter all required fields.'
      });
    }

    const loginValue = username.trim().toLowerCase();

    // Find user by username OR email
    const user = await User.findOne({
      $or: [
        {
          username: loginValue
        },
        {
          email: loginValue
        }
      ]
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'No account with this username/email exists.'
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials.'
      });
    }

    // Create JWT
    const token = jwt.sign(
      {
        id: user._id
      },
      JWT_SECRET,
      {
        expiresIn: '1d'
      }
    );

    // Set authentication cookie
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/'
    });

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });

  } catch (err) {
    console.error('Login error:', err);

    return res.status(500).json({
      success: false,
      message: 'Server error during login.'
    });
  }
});


// ========================================
// LOGOUT
// ========================================
router.post('/logout', (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/'
  });

  return res.status(200).json({
    success: true,
    message: 'Logged out successfully.'
  });
});


// ========================================
// GET CURRENT USER
// ========================================
router.get('/me', authMiddleware, (req, res) => {
  return res.status(200).json({
    success: true,
    user: {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email
    }
  });
});


module.exports = router;

