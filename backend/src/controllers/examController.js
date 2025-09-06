const Exam = require('../models/Exam');

exports.addResult = async (req, res) => {
  const { courseId, studentId, title, score, maxScore } = req.body;
  if (!courseId || !studentId || !title) return res.status(400).json({ message: 'Missing fields' });
  const result = await Exam.create({ course: courseId, student: studentId, title, score: score || 0, maxScore: maxScore || 100, gradedBy: req.user.id });
  res.status(201).json(result);
};

exports.listResults = async (req, res) => {
  const { courseId, studentId } = req.query;
  const filter = {};
  if (courseId) filter.course = courseId;
  if (studentId) filter.student = studentId;
  const results = await Exam.find(filter).populate('student', 'name email').populate('course', 'title code');
  res.json(results);
};

exports.uploadCsv = async (req, res) => {
  // Placeholder: expects { entries: [{ courseId, studentId, title, score, maxScore }] }
  const { entries } = req.body;
  if (!Array.isArray(entries)) return res.status(400).json({ message: 'entries must be an array' });
  const docs = await Exam.insertMany(entries.map(e => ({ ...e, gradedBy: req.user.id })));
  res.status(201).json({ inserted: docs.length });
};