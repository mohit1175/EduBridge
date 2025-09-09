const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
  course: {
    type: String,
    required: true,
    trim: true
  },
  program: {
    type: String,
    enum: ['BSc', 'MSc', 'Other'],
    default: 'BSc'
  },
  department: {
    type: String,
    trim: true
  },
  term: {
    type: Number,
    min: 1,
    max: 8
  },
  day: {
    type: String,
    required: true,
  enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  room: {
    type: String,
    required: true,
    trim: true
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  semester: {
    type: Number,
    required: true,
    min: 1,
    max: 8
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
timetableSchema.index({ day: 1, startTime: 1 });
timetableSchema.index({ course: 1, semester: 1 });
timetableSchema.index({ instructor: 1, day: 1 });
timetableSchema.index({ program: 1, term: 1 });

module.exports = mongoose.model('Timetable', timetableSchema);
