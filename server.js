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

const MONGODB_URI =
  process.env.MONGODB_URI ||
  'mongodb://localhost:27017/resumespark';

const JWT_SECRET =
  process.env.JWT_SECRET ||
  'super_secret_jwt_key_123_resumespark';

// ===============================
// DATABASE CONNECTION
// ===============================

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB database successfully.');
  })
  .catch((err) => {
    console.error('MongoDB database connection error:', err);
  });

// ===============================
// MIDDLEWARE
// ===============================

app.use(express.json({ limit: '10mb' }));

app.use(
  express.urlencoded({
    extended: true,
    limit: '10mb'
  })
);

app.use(cookieParser());

// ===============================
// API ROUTES
// ===============================

app.use('/api/auth', authRoutes);

app.use('/api/resumes', resumeRoutes);

// ===============================
// PROTECTED PAGE HELPER
// ===============================

const protectPage = (fileName) => {
  return (req, res) => {
    const token = req.cookies.token;

    if (!token) {
      return res.redirect('/login page.html');
    }

    try {
      jwt.verify(token, JWT_SECRET);

      res.sendFile(
        path.join(__dirname, 'public', fileName)
      );
    } catch (err) {
      res.clearCookie('token');

      return res.redirect('/login page.html');
    }
  };
};

// ===============================
// PUBLIC LOGIN PAGE
// ===============================

app.get('/', (req, res) => {
  res.sendFile(
    path.join(__dirname, 'public', 'login page.html')
  );
});

app.get('/login page.html', (req, res) => {
  res.sendFile(
    path.join(__dirname, 'public', 'login page.html')
  );
});

// ===============================
// PROTECTED PAGES
// ===============================

app.get(
  '/profile.html',
  protectPage('profile.html')
);

app.get(
  '/page2.html',
  protectPage('page2.html')
);

app.get(
  '/templates.html',
  protectPage('templates.html')
);

app.get(
  '/template1.html',
  protectPage('template1.html')
);

app.get(
  '/template2.html',
  protectPage('template2.html')
);

app.get(
  '/template3.html',
  protectPage('template3.html')
);

app.get(
  '/template4.html',
  protectPage('template4.html')
);

app.get(
  '/template5.html',
  protectPage('template5.html')
);

app.get(
  '/template6.html',
  protectPage('template6.html')
);

app.get(
  '/template7.html',
  protectPage('template7.html')
);

app.get(
  '/template8.html',
  protectPage('template8.html')
);

app.get(
  '/template9.html',
  protectPage('template9.html')
);

// ===============================
// STATIC FILES
// ===============================

app.use(
  express.static(
    path.join(__dirname, 'public')
  )
);

// ===============================
// FALLBACK
// ===============================

app.use((req, res) => {
  res.status(404).send('Page not found');
});

// ===============================
// LOCAL SERVER
// ===============================

// Only start the server when running locally.
// Vercel will use the exported app.

if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(
      `Server is running at http://localhost:${PORT}`
    );
  });
}

// ===============================
// EXPORT FOR VERCEL
// ===============================

module.exports = app;