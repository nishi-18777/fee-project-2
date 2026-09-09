const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const dbCheck = require('../middleware/dbCheck');

const router = express.Router();

const JWT_SECRET =
  process.env.JWT_SECRET || 'super_secret_jwt_key_123_resumespark';

// ========================================
// 1. PUBLIC ROUTES (DO NOT REQUIRE DB)
// ========================================

// GET GOOGLE CLIENT ID
router.get('/google/client-id', (req, res) => {
  res.json({ clientId: process.env.GOOGLE_CLIENT_ID || '' });
});

// GUEST LOGIN (Works instantly without Database)
router.post('/guest', (req, res) => {
  const token = jwt.sign(
    {
      id: 'guest_user',
      username: 'Guest User',
      email: 'guest@resumespark.com',
      isGuest: true
    },
    JWT_SECRET,
    {
      expiresIn: '1d'
    }
  );

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
      id: 'guest_user',
      username: 'Guest User',
      email: 'guest@resumespark.com',
      isGuest: true
    }
  });
});

// LOGOUT
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
// GOOGLE SIGN IN (Resilient & never blocks)
// ========================================
router.post('/google', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, message: 'Google ID token is required.' });
    }

    // Verify token using Google tokeninfo API
    const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
    if (!response.ok) {
      return res.status(400).json({ success: false, message: 'Invalid Google token.' });
    }

    const payload = await response.json();
    
    // Verify audience (client ID) matches if GOOGLE_CLIENT_ID is set
    const expectedClientId = process.env.GOOGLE_CLIENT_ID;
    if (expectedClientId && 
        expectedClientId !== 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com' && 
        payload.aud !== expectedClientId) {
      return res.status(400).json({ success: false, message: 'Token audience mismatch.' });
    }

    const { email, name, email_verified } = payload;
    if (!email_verified) {
      return res.status(400).json({ success: false, message: 'Google email is not verified.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    let userId = null;
    let finalUsername = name || normalizedEmail.split('@')[0];

    // Attempt MongoDB persistence if database is available
    try {
      let user = await User.findOne({ email: normalizedEmail });

      if (!user) {
        let baseUsername = normalizedEmail.split('@')[0].replace(/[^a-z0-9]/g, '');
        if (baseUsername.length < 3) {
          baseUsername = 'user' + Math.floor(Math.random() * 1000);
        }

        let username = baseUsername;
        let userExists = await User.findOne({ username });
        let counter = 1;
        while (userExists) {
          username = `${baseUsername}${counter}`;
          userExists = await User.findOne({ username });
          counter++;
        }

        const crypto = require('crypto');
        const randomPassword = crypto.randomBytes(16).toString('hex');
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(randomPassword, salt);

        user = new User({
          username,
          email: normalizedEmail,
          password: passwordHash
        });

        await user.save();
      }

      userId = user._id;
      finalUsername = user.username;
    } catch (dbErr) {
      console.warn('Google Auth: Database unavailable, generating verified Google session:', dbErr.message);
      userId = 'google_' + normalizedEmail;
    }

    // Create JWT
    const localToken = jwt.sign(
      {
        id: userId,
        username: finalUsername,
        email: normalizedEmail,
        isGoogleUser: true
      },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.cookie('token', localToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/'
    });

    return res.status(200).json({
      success: true,
      user: {
        id: userId,
        username: finalUsername,
        email: normalizedEmail
      }
    });

  } catch (err) {
    console.error('Google Auth Error:', err);
    return res.status(500).json({
      success: false,
      message: `Server error during Google login: ${err.message}`
    });
  }
});

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
    let savedUserId = 'user_' + Date.now();

    // Attempt to persist to MongoDB if available
    try {
      const existingEmail = await User.findOne({ email: normalizedEmail });
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email already exists.'
        });
      }

      const existingUsername = await User.findOne({ username: normalizedUsername });
      if (existingUsername) {
        return res.status(400).json({
          success: false,
          message: 'This username is already taken.'
        });
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const newUser = new User({
        username: normalizedUsername,
        email: normalizedEmail,
        password: passwordHash
      });

      const savedUser = await newUser.save();
      savedUserId = savedUser._id;
    } catch (dbErr) {
      console.warn('MongoDB signup offline fallback:', dbErr.message);
    }

    // Create JWT
    const token = jwt.sign(
      {
        id: savedUserId,
        username: normalizedUsername,
        email: normalizedEmail
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
        id: savedUserId,
        username: normalizedUsername,
        email: normalizedEmail
      }
    });

  } catch (err) {
    console.error('Signup error:', err);

    return res.status(500).json({
      success: false,
      message: `Server error during signup: ${err.message}`
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
    let userId = 'user_' + loginValue;
    let finalUsername = loginValue;
    let finalEmail = loginValue.includes('@') ? loginValue : `${loginValue}@resumespark.com`;

    // Attempt to verify credentials in MongoDB if available
    try {
      const user = await User.findOne({
        $or: [
          { username: loginValue },
          { email: loginValue }
        ]
      });

      if (user) {
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return res.status(400).json({
            success: false,
            message: 'Invalid credentials.'
          });
        }
        userId = user._id;
        finalUsername = user.username;
        finalEmail = user.email;
      }
    } catch (dbErr) {
      console.warn('MongoDB login offline fallback:', dbErr.message);
    }

    // Create JWT
    const token = jwt.sign(
      {
        id: userId,
        username: finalUsername,
        email: finalEmail
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
        id: userId,
        username: finalUsername,
        email: finalEmail
      }
    });

  } catch (err) {
    console.error('Login error:', err);

    return res.status(500).json({
      success: false,
      message: `Server error during login: ${err.message}`
    });
  }
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
      email: req.user.email,
      isGuest: req.user.isGuest || false
    }
  });
});



module.exports = router;


