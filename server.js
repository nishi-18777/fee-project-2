require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const path = require('path');
const jwt = require('jsonwebtoken');

const authRoutes = require('./routes/auth');
const resumeRoutes = require('./routes/resume');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/resumespark';
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_123_resumespark';

// Database Connection
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB database successfully.'))
  .catch(err => console.error('MongoDB database connection error:', err));

// Middleware
app.use(express.json({ limit: '10mb' })); // Support saving large HTML strings
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/resumes', resumeRoutes);

// Helper function to protect pages
const protectPage = (fileName) => {
  return (req, res) => {
    const token = req.cookies.token;
    if (!token) {
      return res.redirect('/login page.html');
    }
    try {
      jwt.verify(token, JWT_SECRET);
      res.sendFile(path.join(__dirname, 'public', fileName));
    } catch (err) {
      res.clearCookie('token');
      res.redirect('/login page.html');
    }
  };
};

// Route Redirects & Page Gates
app.get('/', (req, res) => {
  const token = req.cookies.token;
  if (token) {
    try {
      jwt.verify(token, JWT_SECRET);
      return res.redirect('/page2.html');
    } catch (err) {
      res.clearCookie('token');
    }
  }
  res.sendFile(path.join(__dirname, 'public', 'login page.html'));
});

app.get('/login page.html', (req, res) => {
  const token = req.cookies.token;
  if (token) {
    try {
      jwt.verify(token, JWT_SECRET);
      return res.redirect('/page2.html');
    } catch (err) {
      res.clearCookie('token');
    }
  }
  res.sendFile(path.join(__dirname, 'public', 'login page.html'));
});

// Protect all private pages
app.get('/page2.html', protectPage('page2.html'));
app.get('/templates.html', protectPage('templates.html'));
app.get('/template1.html', protectPage('template1.html'));
app.get('/template2.html', protectPage('template2.html'));
app.get('/template3.html', protectPage('template3.html'));
app.get('/template4.html', protectPage('template4.html'));
app.get('/template5.html', protectPage('template5.html'));

// Serve assets and general static files
app.use(express.static(path.join(__dirname, 'public')));

// Fallback/Catch-all route
app.use((req, res) => {
  res.status(404).send('Page not found');
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
