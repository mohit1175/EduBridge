const mongoose = require('mongoose');

const examConfigSchema = new mongoose.Schema({
  subjectName: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  internalMarks: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  externalMarks: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  icaOption: {
    type: String,
    enum: ['best', 'average'],
    required: true
  },
  icaCount: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  otherInternalMarks: {
    type: Number,
    required: true,
    min: 0,
    max: 100
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

module.exports = mongoose.model('ExamConfig', examConfigSchema);
