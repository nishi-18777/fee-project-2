const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  templateId: {
    type: String,
    required: true
  },
  htmlContent: {
    type: String,
    required: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to ensure a user has one save per template
resumeSchema.index({ userId: 1, templateId: 1 }, { unique: true });

module.exports = mongoose.model('Resume', resumeSchema);
