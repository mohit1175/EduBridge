const Doubt = require('../models/Doubt');

exports.createDoubt = async (req, res) => {
  const { courseId, title, description } = req.body;
  if (!title) return res.status(400).json({ message: 'Title required' });
  const doubt = await Doubt.create({ course: courseId || null, student: req.user.id, title, description });
  res.status(201).json(doubt);
};

exports.listDoubts = async (req, res) => {
  let filter = {};
  if (req.user.role === 'student') {
    filter.student = req.user.id;
  }
  const doubts = await Doubt.find(filter).populate('student', 'name email').populate('course', 'title code');
  res.json(doubts);
};

exports.answerDoubt = async (req, res) => {
  const { answer } = req.body;
  const doubt = await Doubt.findByIdAndUpdate(
    req.params.id,
    { answer, answeredBy: req.user.id, status: 'answered' },
    { new: true }
  );
  if (!doubt) return res.status(404).json({ message: 'Not found' });
  res.json(doubt);
};