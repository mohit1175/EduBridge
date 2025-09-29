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
  // New: support multiple instructors (co-teaching). Keep single instructor for backward compatibility.
  instructors: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
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

// Keep instructor and instructors in sync where possible
courseSchema.pre('save', function(next) {
  try {
    // Ensure primary instructor is included in instructors
    if (this.instructor) {
      this.instructors = this.instructors || [];
      const has = this.instructors.find(id => String(id) === String(this.instructor));
      if (!has) this.instructors.unshift(this.instructor);
    }
    // If no primary but have instructors, set the first as primary
    if (!this.instructor && Array.isArray(this.instructors) && this.instructors.length) {
      this.instructor = this.instructors[0];
    }
  } catch(_) {}
  next();
});

module.exports = mongoose.model('Course', courseSchema);
