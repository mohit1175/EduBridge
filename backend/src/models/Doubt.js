const mongoose = require('mongoose');

const doubtSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String },
    answer: { type: String },
    answeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['open', 'answered'], default: 'open' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Doubt', doubtSchema);