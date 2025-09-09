const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  courseName: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  courseCode: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  department: {
    type: String,
    required: true,
    trim: true
  },
  semester: {
    type: Number,
    required: true,
    min: 1,
    max: 8
  },
  credits: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  program: {
    type: String,
    enum: ['BSc', 'MSc'],
    default: 'BSc'
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Optional HOD owner for the course
  hod: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  description: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Optional explicit enrollment list; if present, APIs can use this over department/semester heuristic
  students: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ]
}, {
  timestamps: true
});

module.exports = mongoose.model('Course', courseSchema);
