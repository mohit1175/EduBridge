const mongoose = require('mongoose');

const examResultSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  exam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
  required: false
  },
  course: {
    type: String,
    required: true,
    trim: true
  },
  examType: {
    type: String,
    required: true,
    enum: ['ICA', 'Internal', 'External']
  },
  examName: {
    type: String,
    required: true,
    trim: true
  },
  marks: {
    type: Number,
    required: true,
    min: 0
  },
  totalMarks: {
    type: Number,
    required: true,
    min: 1
  },
  percentage: {
    type: Number,
    min: 0,
    max: 100
  },
  grade: {
    type: String,
    enum: ['A+', 'A', 'B', 'C', 'D', 'F']
  },
  date: {
    type: Date,
    required: true
  },
  semester: {
    type: Number,
    min: 1,
    max: 8
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Calculate percentage and grade before saving
examResultSchema.pre('save', function(next) {
  if (this.marks !== undefined && this.totalMarks !== undefined) {
    this.percentage = Math.round((this.marks / this.totalMarks) * 100);
    
    // Calculate grade
    if (this.percentage >= 90) this.grade = 'A+';
    else if (this.percentage >= 80) this.grade = 'A';
    else if (this.percentage >= 70) this.grade = 'B';
    else if (this.percentage >= 60) this.grade = 'C';
    else if (this.percentage >= 40) this.grade = 'D';
    else this.grade = 'F';
  }
  next();
});

// Index for efficient queries
examResultSchema.index({ student: 1, course: 1 });
examResultSchema.index({ exam: 1 });
examResultSchema.index({ examType: 1 });

module.exports = mongoose.model('ExamResult', examResultSchema);
