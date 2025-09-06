const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['admin', 'teacher', 'hod', 'student'], default: 'student', index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);