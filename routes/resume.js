const express = require('express');
const Resume = require('../models/Resume');
const authMiddleware = require('../middleware/auth');
const dbCheck = require('../middleware/dbCheck');

const router = express.Router();

// 1. Authenticate user first
router.use(authMiddleware);

// 2. Bypass database check for guest users; enforce dbCheck for registered users
router.use((req, res, next) => {
  if (req.user && req.user.isGuest) {
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

    if (req.user.isGuest) {
      return res.json({
        success: true,
        message: 'Resume saved in session (Guest Mode).',
        resume: { templateId, htmlContent, updatedAt: Date.now() }
      });
    }

    // Upsert resume content for the user/template combo in MongoDB
    const resume = await Resume.findOneAndUpdate(
      { userId: req.user._id, templateId },
      { htmlContent, updatedAt: Date.now() },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json({ success: true, message: 'Resume saved successfully.', resume });
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

    if (req.user.isGuest) {
      return res.json({ success: true, htmlContent: null, message: 'Guest mode: using local template.' });
    }

    const resume = await Resume.findOne({ userId: req.user._id, templateId });

    if (!resume) {
      return res.json({ success: true, htmlContent: null, message: 'No saved resume found for this template.' });
    }

    res.json({ success: true, htmlContent: resume.htmlContent });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get all saved resumes for the current user
router.get('/my-resumes', async (req, res) => {
  try {
    if (req.user.isGuest) {
      return res.json({ success: true, resumes: [] });
    }

    const resumes = await Resume.find({ userId: req.user._id }, 'templateId updatedAt');
    res.json({ success: true, resumes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete Saved Resume
router.delete('/delete/:templateId', async (req, res) => {
  try {
    const { templateId } = req.params;

    if (req.user.isGuest) {
      return res.json({ success: true, message: 'Resume deleted.' });
    }

    const result = await Resume.findOneAndDelete({ userId: req.user._id, templateId });
    if (!result) {
      return res.status(404).json({ success: false, message: 'Resume not found.' });
    }
    res.json({ success: true, message: 'Resume deleted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
