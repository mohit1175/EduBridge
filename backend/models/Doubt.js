const mongoose = require('mongoose');

const doubtSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: String,
    required: true,
    trim: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  question: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    enum: ['attendance', 'marks', 'timetable', 'other'],
    default: 'other'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'answered', 'resolved'],
    default: 'pending'
  },
  answer: {
    type: String,
    trim: true
  },
  answeredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  answeredAt: {
    type: Date
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  attachments: [{
    filename: String,
    url: String,
    mimetype: String
  }]
}, {
  timestamps: true
});

// Index for efficient queries
doubtSchema.index({ student: 1, status: 1 });
doubtSchema.index({ course: 1, status: 1 });

module.exports = mongoose.model('Doubt', doubtSchema);
