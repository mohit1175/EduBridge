const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
  examType: {
    type: String,
    required: true,
    enum: ['ICA Test 1', 'ICA Test 2', 'ICA Test 3', 'Other Internal', 'External']
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  examDate: {
    type: Date,
    required: true
  },
  examTime: {
    type: String,
    default: '10:00 AM'
  },
  duration: {
    type: String,
    default: '1hr'
  },
  room: {
    type: String,
    default: 'A1'
  },
  examLink: {
    type: String,
    trim: true
  },
  totalMarks: {
    type: Number,
    required: true,
    default: 100
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Exam', examSchema);
