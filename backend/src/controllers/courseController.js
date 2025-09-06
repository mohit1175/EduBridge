const Course = require('../models/Course');
const User = require('../models/User');

exports.listCourses = async (_req, res) => {
  const courses = await Course.find().populate('teacher', 'name email role');
  res.json(courses);
};

exports.getCourse = async (req, res) => {
  const course = await Course.findById(req.params.id).populate('teacher', 'name email role');
  if (!course) return res.status(404).json({ message: 'Not found' });
  res.json(course);
};

exports.createCourse = async (req, res) => {
  const { title, code, description } = req.body;
  const course = await Course.create({ title, code, description });
  res.status(201).json(course);
};

exports.updateCourse = async (req, res) => {
  const { title, code, description } = req.body;
  const course = await Course.findByIdAndUpdate(
    req.params.id,
    { title, code, description },
    { new: true }
  );
  if (!course) return res.status(404).json({ message: 'Not found' });
  res.json(course);
};

exports.deleteCourse = async (req, res) => {
  const course = await Course.findByIdAndDelete(req.params.id);
  if (!course) return res.status(404).json({ message: 'Not found' });
  res.json({ success: true });
};

exports.assignTeacher = async (req, res) => {
  const { teacherId } = req.body;
  const teacher = await User.findById(teacherId);
  if (!teacher || teacher.role !== 'teacher') return res.status(400).json({ message: 'Invalid teacher' });
  const course = await Course.findByIdAndUpdate(req.params.id, { teacher: teacherId }, { new: true });
  if (!course) return res.status(404).json({ message: 'Not found' });
  res.json(course);
};

exports.enrollStudent = async (req, res) => {
  const { studentId } = req.body;
  const student = await User.findById(studentId);
  if (!student || student.role !== 'student') return res.status(400).json({ message: 'Invalid student' });
  const course = await Course.findByIdAndUpdate(
    req.params.id,
    { $addToSet: { students: studentId } },
    { new: true }
  );
  if (!course) return res.status(404).json({ message: 'Not found' });
  res.json(course);
};

exports.myCourses = async (req, res) => {
  const userId = req.user.id;
  if (req.user.role === 'teacher') {
    const courses = await Course.find({ teacher: userId });
    return res.json(courses);
  }
  if (req.user.role === 'student') {
    const courses = await Course.find({ students: userId });
    return res.json(courses);
  }
  const courses = await Course.find();
  res.json(courses);
};