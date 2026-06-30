const express = require('express');
const Resume = require('../models/Resume');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Save Resume Data
router.post('/save', authMiddleware, async (req, res) => {
  try {
    const { templateId, htmlContent } = req.body;

    if (!templateId || htmlContent === undefined) {
      return res.status(400).json({ success: false, message: 'Template ID and HTML Content are required.' });
    }

    // Upsert resume content for the user/template combo
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
router.get('/load', authMiddleware, async (req, res) => {
  try {
    const { templateId } = req.query;

    if (!templateId) {
      return res.status(400).json({ success: false, message: 'Template ID is required.' });
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

module.exports = router;
