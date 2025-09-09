const express = require('express');
const { body, validationResult } = require('express-validator');
const Course = require('../models/Course');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
let XLSX;
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/courses
// @desc    Get all courses
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { department, semester, instructor } = req.query;
    let query = { isActive: true };

    if (department) query.department = department;
    if (semester) query.semester = parseInt(semester);
    if (instructor && instructor !== 'undefined' && instructor !== 'null') {
      // Only add if looks like a Mongo ObjectId
      if (/^[a-fA-F0-9]{24}$/.test(instructor)) {
        query.instructor = instructor;
      }
    }

    const courses = await Course.find(query)
      .populate('instructor', 'name email')
      .sort({ courseName: 1 });

    res.json(courses);
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/courses
// @desc    Create a new course
// @access  Private (Teachers)
router.post('/', auth, authorize('teacher_level1', 'teacher_level2'), [
  body('courseName').trim().notEmpty().withMessage('Course name is required'),
  body('courseCode').trim().notEmpty().withMessage('Course code is required'),
  body('department').trim().notEmpty().withMessage('Department is required'),
  body('semester').isInt({ min: 1, max: 8 }).withMessage('Semester must be between 1 and 8'),
  body('credits').isInt({ min: 1, max: 10 }).withMessage('Credits must be between 1 and 10')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const course = new Course({
      ...req.body,
      instructor: req.user._id
    });

    await course.save();
    await course.populate('instructor', 'name email');

    res.status(201).json({
      message: 'Course created successfully',
      course
    });
  } catch (error) {
    console.error('Create course error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Course name or code already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/courses/:id
// @desc    Update a course
// @access  Private (Teachers)
router.put('/:id', auth, authorize('teacher_level1', 'teacher_level2'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user is the instructor or admin
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'teacher_level1') {
      return res.status(403).json({ message: 'Not authorized to update this course' });
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('instructor', 'name email');

    res.json({
      message: 'Course updated successfully',
      course: updatedCourse
    });
  } catch (error) {
    console.error('Update course error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Course name or code already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/courses/:id
// @desc    Delete a course
// @access  Private (Teachers)
router.delete('/:id', auth, authorize('teacher_level1', 'teacher_level2'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user is the instructor or admin
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'teacher_level1') {
      return res.status(403).json({ message: 'Not authorized to delete this course' });
    }

    // Soft delete by setting isActive to false
    course.isActive = false;
    await course.save();

    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/courses/:id
// @desc    Get a specific course
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name email');

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json(course);
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

// Additional endpoints

// @route   GET /api/courses/:id/students
// @desc    Get students enrolled/eligible for this course (by department + semester)
// @access  Private
router.get('/:id/students', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('students', 'name email rollNumber department semester');
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Prefer explicit enrollment if provided
    if (course.students && course.students.length) {
      return res.json(course.students);
    }

    // Fallback heuristic: same department and semester
    const students = await User.find({
      role: 'student',
      isActive: true,
      department: course.department,
      semester: course.semester
    }).select('name email rollNumber department semester');

    res.json(students);
  } catch (error) {
    console.error('Get course students error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// =============== HOD: Instructor assignment ===============
// Multer storage for assignment uploads
const assignDir = path.join(__dirname, '..', 'uploads', 'admin');
if (!fs.existsSync(assignDir)) fs.mkdirSync(assignDir, { recursive: true });
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, assignDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

// Helper: lazy-load xlsx to avoid requiring in environments without it
function getXLSX() {
  if (!XLSX) {
    try { XLSX = require('xlsx'); } catch (e) { /* eslint-disable no-empty */ }
  }
  return XLSX;
}

// POST /api/courses/assignments/upload
// Accepts CSV/XLSX with columns: courseCode, courseName, department, semester, credits(optional), teacherEmail|teacherName
router.post('/assignments/upload', auth, authorize('teacher_level1'), upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const ext = path.extname(req.file.originalname).toLowerCase();
    let rows = [];
    if (ext === '.xlsx' || ext === '.xls') {
      const xlsx = getXLSX();
      if (!xlsx) return res.status(500).json({ message: 'XLSX parser not available on server' });
      const wb = xlsx.readFile(req.file.path);
      const sheet = wb.SheetNames[0];
      rows = xlsx.utils.sheet_to_json(wb.Sheets[sheet], { defval: '' });
    } else if (ext === '.csv') {
      try {
        const content = fs.readFileSync(req.file.path, 'utf8');
        const { parse } = require('csv-parse/sync');
        rows = parse(content, { columns: true, skip_empty_lines: true, bom: true, trim: true });
      } catch (e) {
        return res.status(400).json({ message: 'Unable to parse CSV: ' + e.message });
      }
    } else {
      return res.status(400).json({ message: 'Unsupported file type. Use .xlsx, .xls, or .csv' });
    }

    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ message: 'No rows found in the uploaded file' });
    }

    const results = [];
    for (const r of rows) {
      try {
        const courseCode = (r.courseCode || r.code || '').trim();
        const courseName = (r.courseName || r.subject || r.course || '').trim();
        const department = (r.department || req.user.department || '').trim();
        const semester = Number(r.semester || r.term || r.Semester || 0);
        const credits = Number(r.credits || r.Credits || 0) || undefined;
        const teacherEmail = (r.teacherEmail || r.email || r.teacher || '').trim().toLowerCase();
        const teacherName = (r.teacherName || r.instructor || '').trim();

        if (!courseCode && !courseName) { results.push({ status: 'skipped', reason: 'missing courseCode/courseName', row: { courseCode, courseName } }); continue; }
        if (!semester) { results.push({ status: 'skipped', reason: 'missing semester', row: { courseCode, courseName } }); continue; }

        // Find teacher by email or name
        let instructor = null;
        if (teacherEmail) instructor = await User.findOne({ email: teacherEmail, role: { $in: ['teacher_level1','teacher_level2'] } });
        if (!instructor && teacherName) instructor = await User.findOne({ name: new RegExp('^' + teacherName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i'), role: { $in: ['teacher_level1','teacher_level2'] } });
        if (!instructor) { results.push({ status: 'skipped', reason: 'teacher not found', row: { courseCode, courseName } }); continue; }

        // Upsert course by code or name
        let course = await Course.findOne(courseCode ? { courseCode } : { courseName });
        if (!course) {
          if (!courseCode || !courseName || !department || !credits) {
            results.push({ status: 'skipped', reason: 'cannot create course due to missing fields', row: { courseCode, courseName } });
            continue;
          }
          course = await Course.create({ courseCode, courseName, department, semester, credits, instructor: instructor._id });
        } else {
          course.instructor = instructor._id;
          if (department) course.department = department;
          if (semester) course.semester = semester;
          if (credits) course.credits = credits;
          await course.save();
        }
        results.push({ status: 'assigned', courseId: course._id, courseCode, instructor: instructor.email });
      } catch (rowErr) {
        console.error('Row processing error:', rowErr);
        results.push({ status: 'skipped', reason: 'row error: ' + rowErr.message });
      }
    }

    // Clean up uploaded file (best effort)
    try { fs.unlink(req.file.path, () => {}); } catch {}

    res.json({ message: 'Assignments processed', results });
  } catch (error) {
    console.error('Assignments upload error:', error);
    res.status(500).json({ message: 'Server error processing assignments: ' + (error?.message || 'unknown') });
  }
});

// PUT /api/courses/:id/instructor - set/replace instructor
router.put('/:id/instructor', auth, authorize('teacher_level1'), async (req, res) => {
  try {
    const { instructorId } = req.body;
    if (!instructorId) return res.status(400).json({ message: 'instructorId is required' });
    const teacher = await User.findOne({ _id: instructorId, role: { $in: ['teacher_level1','teacher_level2'] } });
    if (!teacher) return res.status(404).json({ message: 'Instructor not found' });
    const course = await Course.findByIdAndUpdate(req.params.id, { instructor: instructorId }, { new: true })
      .populate('instructor','name email');
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json({ message: 'Instructor updated', course });
  } catch (error) {
    console.error('Update instructor error:', error);
    res.status(500).json({ message: 'Server error updating instructor' });
  }
});
