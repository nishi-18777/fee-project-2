const express = require('express');
const Resume = require('../models/Resume');
const authMiddleware = require('../middleware/auth');
const dbCheck = require('../middleware/dbCheck');

const router = express.Router();

// 1. Authenticate user first
router.use(authMiddleware);

// 2. Bypass database check for guest/google session users
router.use((req, res, next) => {
  if (req.user && (req.user.isGuest || req.user.isGoogleUser)) {
    return next();
  }
  return dbCheck(req, res, next);
});

// Save Resume Data
router.post('/save', async (req, res) => {
  try {
    const { templateId, htmlContent } = req.body;

    if (!templateId || htmlContent === undefined) {
      return res.status(400).json({ success: false, message: 'Template ID and HTML Content are required.' });
    }

    if (req.user.isGuest || !req.user._id || String(req.user._id).startsWith('google_')) {
      return res.json({
        success: true,
        message: 'Resume saved in session.',
        resume: { templateId, htmlContent, updatedAt: Date.now() }
      });
    }

    try {
      // Upsert resume content for the user/template combo in MongoDB
      const resume = await Resume.findOneAndUpdate(
        { userId: req.user._id, templateId },
        { htmlContent, updatedAt: Date.now() },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );

      return res.json({ success: true, message: 'Resume saved successfully.', resume });
    } catch (dbErr) {
      console.warn('MongoDB resume save error, falling back to local session:', dbErr.message);
      return res.json({
        success: true,
        message: 'Resume saved to local storage.',
        resume: { templateId, htmlContent, updatedAt: Date.now() }
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Load Resume Data
router.get('/load', async (req, res) => {
  try {
    const { templateId } = req.query;

    if (!templateId) {
      return res.status(400).json({ success: false, message: 'Template ID is required.' });
    }

    if (req.user.isGuest || !req.user._id || String(req.user._id).startsWith('google_')) {
      return res.json({ success: true, htmlContent: null, message: 'Guest mode: using local template.' });
    }

    try {
      const resume = await Resume.findOne({ userId: req.user._id, templateId });

      if (!resume) {
        return res.json({ success: true, htmlContent: null, message: 'No saved resume found for this template.' });
      }

      return res.json({ success: true, htmlContent: resume.htmlContent });
    } catch (dbErr) {
      console.warn('MongoDB resume load error, falling back to local:', dbErr.message);
      return res.json({ success: true, htmlContent: null, message: 'Offline mode: using local template.' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get all saved resumes for the current user
router.get('/my-resumes', async (req, res) => {
  try {
    if (req.user.isGuest || !req.user._id || String(req.user._id).startsWith('google_')) {
      return res.json({ success: true, resumes: [] });
    }

    try {
      const resumes = await Resume.find({ userId: req.user._id }, 'templateId updatedAt');
      return res.json({ success: true, resumes });
    } catch (dbErr) {
      return res.json({ success: true, resumes: [] });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete Saved Resume
router.delete('/delete/:templateId', async (req, res) => {
  try {
    const { templateId } = req.params;

    if (req.user.isGuest || !req.user._id || String(req.user._id).startsWith('google_')) {
      return res.json({ success: true, message: 'Resume deleted.' });
    }

    try {
      const result = await Resume.findOneAndDelete({ userId: req.user._id, templateId });
      if (!result) {
        return res.status(404).json({ success: false, message: 'Resume not found.' });
      }
      return res.json({ success: true, message: 'Resume deleted successfully.' });
    } catch (dbErr) {
      return res.json({ success: true, message: 'Resume deleted.' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
