const Attendance = require('../models/Attendance');

exports.markAttendance = async (req, res) => {
  const { courseId, studentId, date, present } = req.body;
  if (!courseId || !studentId || !date) return res.status(400).json({ message: 'Missing fields' });
  const doc = await Attendance.findOneAndUpdate(
    { course: courseId, student: studentId, date: new Date(date) },
    { course: courseId, student: studentId, date: new Date(date), present: !!present, markedBy: req.user.id },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  res.status(201).json(doc);
};

exports.getStudentAttendance = async (req, res) => {
  const { id } = req.params;
  const docs = await Attendance.find({ student: id }).populate('course', 'title code');
  res.json(docs);
};

exports.getCourseAttendance = async (req, res) => {
  const { id } = req.params;
  const docs = await Attendance.find({ course: id }).populate('student', 'name email');
  res.json(docs);
};