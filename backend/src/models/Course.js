const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    description: { type: String },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    timetable: {
      days: [{
        day: { type: String },
        slots: [{ start: String, end: String, room: String }]
      }]
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Course', courseSchema);