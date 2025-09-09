const express = require('express');
const { body, validationResult } = require('express-validator');
const Exam = require('../models/Exam');
const ExamResult = require('../models/ExamResult');
const ExamConfig = require('../models/ExamConfig');
const Course = require('../models/Course');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/exams
// @desc    Get all exams
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { course, examType, upcoming } = req.query;
    let query = { isActive: true };

    if (course) query.subject = course;
    if (examType) query.examType = examType;
    if (upcoming === 'true') {
      query.examDate = { $gte: new Date() };
    }

    const exams = await Exam.find(query)
      .populate('createdBy', 'name email')
      .sort({ examDate: 1 });

    res.json(exams);
  } catch (error) {
    console.error('Get exams error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/exams
// @desc    Create a new exam
// @access  Private (Teacher Level 2)
router.post('/', auth, authorize('teacher_level2'), [
  body('examType').isIn(['ICA Test 1', 'ICA Test 2', 'ICA Test 3', 'Other Internal', 'External']).withMessage('Invalid exam type'),
  body('subject').trim().notEmpty().withMessage('Subject is required'),
  body('examDate').isISO8601().withMessage('Valid exam date is required'),
  body('totalMarks').isInt({ min: 1 }).withMessage('Total marks must be a positive integer')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const exam = new Exam({
      ...req.body,
      createdBy: req.user._id
    });

    await exam.save();
    await exam.populate('createdBy', 'name email');

    res.status(201).json({
      message: 'Exam created successfully',
      exam
    });
  } catch (error) {
    console.error('Create exam error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/exams/:id
// @desc    Update an exam
// @access  Private (Teacher Level 2)
router.put('/:id', auth, authorize('teacher_level2'), async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    // Check if user created this exam or is admin
    if (exam.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'teacher_level1') {
      return res.status(403).json({ message: 'Not authorized to update this exam' });
    }

    const updatedExam = await Exam.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    res.json({
      message: 'Exam updated successfully',
      exam: updatedExam
    });
  } catch (error) {
    console.error('Update exam error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/exams/:id
// @desc    Delete an exam
// @access  Private (Teacher Level 2)
router.delete('/:id', auth, authorize('teacher_level2'), async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    // Check if user created this exam or is admin
    if (exam.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'teacher_level1') {
      return res.status(403).json({ message: 'Not authorized to delete this exam' });
    }

    await Exam.findByIdAndDelete(req.params.id);

    res.json({ message: 'Exam deleted successfully' });
  } catch (error) {
    console.error('Delete exam error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/exams/results
// @desc    Get exam results
// @access  Private
router.get('/results', auth, async (req, res) => {
  try {
    const { student, course, examType, semester } = req.query;
    let query = {};

    // Students can only see their own results
    if (req.user.role === 'student') {
      query.student = req.user._id;
    } else if (student) {
      query.student = student;
    }

    if (course) query.course = course;
    if (examType) query.examType = examType;
    if (semester) query.semester = parseInt(semester);

    const results = await ExamResult.find(query)
      .populate('student', 'name rollNumber')
      .populate('exam', 'examType subject examDate')
      .sort({ date: -1 });

    res.json(results);
  } catch (error) {
    console.error('Get exam results error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/exams/results
// @desc    Upload exam results
// @access  Private (Teacher Level 2)
router.post('/results', auth, authorize('teacher_level2'), [
  body('results').isArray().withMessage('Results must be an array'),
  body('results.*.student').notEmpty().withMessage('Student is required'),
  body('results.*.course').trim().notEmpty().withMessage('Course is required'),
  body('results.*.examType').isIn(['ICA', 'Internal', 'External']).withMessage('Invalid exam type'),
  body('results.*.examName').optional().isString().withMessage('Invalid exam name'),
  body('results.*.marks').isInt({ min: 0 }).withMessage('Marks must be non-negative'),
  body('results.*.totalMarks').isInt({ min: 1 }).withMessage('Total marks must be positive')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { results } = req.body;

    // Cache courses by name to minimize DB queries
    const courseCache = new Map();
    async function getCourseByName(name) {
      if (courseCache.has(name)) return courseCache.get(name);
      const course = await Course.findOne({ courseName: name }).populate('students', 'name email rollNumber department semester');
      courseCache.set(name, course);
      return course;
    }

    function isObjectIdString(v) { return typeof v === 'string' && /^[a-fA-F0-9]{24}$/.test(v); }

    async function resolveStudent(ref, courseName) {
      if (!ref) return null;
      if (isObjectIdString(ref)) return ref;
      const course = await getCourseByName(courseName);
      let candidates = [];
      if (course && Array.isArray(course.students) && course.students.length) {
        candidates = course.students;
      }
      const refStr = String(ref).trim();
      const lc = refStr.toLowerCase();
      let found = candidates.find(s => (
        (s.rollNumber && String(s.rollNumber).trim() === refStr) ||
        (s.email && String(s.email).trim().toLowerCase() === lc) ||
        (s.name && String(s.name).trim().toLowerCase() === lc)
      ));
      if (!found && course) {
        // Second-chance fallback: department + semester scope
        const broad = await require('../models/User').find({
          role: 'student',
          isActive: true,
          department: course.department,
          semester: course.semester
        }).select('name email rollNumber');
        found = broad.find(s => (
          (s.rollNumber && String(s.rollNumber).trim() === refStr) ||
          (s.email && String(s.email).trim().toLowerCase() === lc) ||
          (s.name && String(s.name).trim().toLowerCase() === lc)
        ));
      }
      return found ? String(found._id) : null;
    }

    // Prepare records, resolve students when needed, and compute derived fields
    const prepared = [];
    for (const r of results) {
      const studentId = await resolveStudent(r.student, r.course);
      if (!studentId) {
        return res.status(400).json({ message: `Invalid student reference for course ${r.course}` });
      }
      const total = Number(r.totalMarks);
      const marks = Number(r.marks);
      const percentage = total ? Math.round((marks / total) * 100) : undefined;
      let grade = undefined;
      if (percentage !== undefined) {
        if (percentage >= 90) grade = 'A+';
        else if (percentage >= 80) grade = 'A';
        else if (percentage >= 70) grade = 'B';
        else if (percentage >= 60) grade = 'C';
        else if (percentage >= 40) grade = 'D';
        else grade = 'F';
      }
      prepared.push({
        student: studentId,
        course: r.course,
        examType: r.examType,
        examName: r.examName || r.examType,
        marks,
        totalMarks: total,
        percentage,
        grade,
        uploadedBy: req.user._id,
        date: r.date || new Date(),
        semester: r.semester ? Number(r.semester) : undefined
      });
    }

    const savedResults = await ExamResult.insertMany(prepared);

    res.status(201).json({
      message: 'Exam results uploaded successfully',
      results: savedResults
    });
  } catch (error) {
    console.error('Upload exam results error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/exams/config
// @desc    Get exam configurations
// @access  Private
router.get('/config', auth, async (req, res) => {
  try {
    const configs = await ExamConfig.find({ isActive: true })
      .populate('createdBy', 'name email');

    res.json(configs);
  } catch (error) {
    console.error('Get exam configs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/exams/config
// @desc    Create exam configuration
// @access  Private (Teacher Level 1)
router.post('/config', auth, authorize('teacher_level1'), [
  body('subjectName').trim().notEmpty().withMessage('Subject name is required'),
  body('internalMarks').isInt({ min: 0, max: 100 }).withMessage('Internal marks must be between 0 and 100'),
  body('externalMarks').isInt({ min: 0, max: 100 }).withMessage('External marks must be between 0 and 100'),
  body('icaOption').isIn(['best', 'average']).withMessage('ICA option must be best or average'),
  body('icaCount').isInt({ min: 1, max: 5 }).withMessage('ICA count must be between 1 and 5'),
  body('otherInternalMarks').isInt({ min: 0, max: 100 }).withMessage('Other internal marks must be between 0 and 100')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const config = new ExamConfig({
      ...req.body,
      createdBy: req.user._id
    });

    await config.save();
    await config.populate('createdBy', 'name email');

    res.status(201).json({
      message: 'Exam configuration created successfully',
      config
    });
  } catch (error) {
    console.error('Create exam config error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/exams/stats
// @desc    Get exam statistics
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
  const { course, examType, semester, groupBy } = req.query;
    let matchQuery = {};

    if (req.user.role === 'student') {
      matchQuery.student = req.user._id;
    }
    if (course) matchQuery.course = course;
    if (examType) matchQuery.examType = examType;
    if (semester) matchQuery.semester = parseInt(semester);

  const stats = await ExamResult.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          average: { $avg: '$percentage' },
          highest: { $max: '$percentage' },
          lowest: { $min: '$percentage' },
          passCount: {
            $sum: { $cond: [{ $gte: ['$percentage', 40] }, 1, 0] }
          }
        }
      }
    ]);

    const gradeStats = await ExamResult.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$grade',
          count: { $sum: 1 }
        }
      }
    ]);

    const result = {
      stats: stats[0] || { total: 0, average: 0, highest: 0, lowest: 0, passCount: 0 },
      gradeDistribution: gradeStats
    };

    // Optional grouping for HOD subject-wise averages
    if (groupBy === 'course') {
      const courseAverages = await ExamResult.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: '$course',
            count: { $sum: 1 },
            average: { $avg: '$percentage' }
          }
        },
        {
          $project: {
            _id: 0,
            course: '$_id',
            count: 1,
            average: { $round: ['$average', 2] }
          }
        },
        { $sort: { course: 1 } }
      ]);
      result.courseAverages = courseAverages;
    }

    res.json(result);
  } catch (error) {
    console.error('Get exam stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
