const express = require('express');
const multer = require('multer');
const csv = require('csv-parse/sync');
const fs = require('fs');
const path = require('path');
const { auth, authorize } = require('../middleware/auth');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const AdminLog = require('../models/AdminLog');
const Course = require('../models/Course');
const XLSX = require('xlsx');

const router = express.Router();

// Admin-only middleware
router.use(auth, authorize('admin'));

// Storage for PDF uploads
const uploadDir = path.join(__dirname, '..', 'uploads', 'admin');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

// Upload PDF for a class (e.g., syllabus, materials)
router.post('/upload/pdf', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  res.json({ message: 'File uploaded', filePath: `/uploads/admin/${req.file.filename}` });
});

// Bulk create students from CSV text (email,name,rollNumber,department,semester)
router.post('/students/bulk', async (req, res) => {
  try {
    const { csvText, commonPassword = 'changeme123' } = req.body;
    if (!csvText) return res.status(400).json({ message: 'csvText is required' });

    const records = csv.parse(csvText, { columns: true, skip_empty_lines: true });
    const created = [];
    const skipped = [];

    for (const r of records) {
      const email = (r.email || '').toLowerCase().trim();
      if (!email) { skipped.push({ reason: 'missing email', row: r }); continue; }
      const exists = await User.findOne({ email });
      if (exists) { skipped.push({ reason: 'exists', email }); continue; }
      const student = await User.create({
        name: r.name || email.split('@')[0],
        email,
        password: commonPassword,
        role: 'student',
        rollNumber: r.rollNumber,
        department: r.department,
        semester: r.semester ? Number(r.semester) : undefined
      });
      created.push({ id: student._id, email: student.email });
    }

    res.json({ message: 'Bulk create completed', createdCount: created.length, created, skipped });
  } catch (err) {
    console.error('Bulk students error:', err);
    res.status(500).json({ message: 'Server error during bulk create' });
  }
});

// Platform metrics for dashboard
router.get('/metrics/overview', async (req, res) => {
  try {
    const [totalStudents, totalTeachers, totalCourses, totalAttendance] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: { $in: ['teacher_level1', 'teacher_level2'] } }),
      Course.countDocuments({}),
      Attendance.countDocuments({})
    ]);

    // Attendance rate (simple aggregation of present vs total)
    const agg = await Attendance.aggregate([
      { $group: { _id: '$status', c: { $sum: 1 } } }
    ]);
    const total = agg.reduce((s, a) => s + a.c, 0) || 1;
    const present = (agg.find(a => a._id === 'present')?.c) || 0;
    const attendanceRate = Math.round((present / total) * 100);

    res.json({
      totals: { students: totalStudents, teachers: totalTeachers, courses: totalCourses, attendanceRecords: totalAttendance },
      attendanceRate
    });
  } catch (err) {
    console.error('Metrics error:', err);
    res.status(500).json({ message: 'Server error getting metrics' });
  }
});

// Admin logs listing with pagination and basic filters
// Query: page, limit, action, status
router.get('/logs', async (req, res) => {
  try {
    const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 10));
    const page = Math.max(1, Number(req.query.page) || 1);
    const { action, status } = req.query;
    const q = {};
    if (action) q.action = new RegExp('^' + String(action).trim(), 'i');
    if (status) q.status = String(status).trim();
    const total = await AdminLog.countDocuments(q);
    const logs = await AdminLog.find(q)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
    res.json({ logs, page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) });
  } catch (e) {
    console.error('Admin logs error:', e);
    res.status(500).json({ message: 'Server error getting admin logs' });
  }
});

// Optional: delete a log by id
router.delete('/logs/:id', async (req, res) => {
  try {
    const r = await AdminLog.findByIdAndDelete(req.params.id);
    if (!r) return res.status(404).json({ message: 'Log not found' });
    res.json({ message: 'Log deleted' });
  } catch (e) {
    console.error('Admin log delete error:', e);
    res.status(500).json({ message: 'Server error deleting admin log' });
  }
});

module.exports = router;

// ========== New: Assign HODs to courses via CSV/XLSX ==========
// Columns: courseCode|courseName, hodEmail|hodName
router.post('/courses/hod/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const ext = path.extname(req.file.originalname).toLowerCase();
    let rows = [];
    if (ext === '.xlsx' || ext === '.xls') {
      const wb = XLSX.readFile(req.file.path);
      rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: '' });
    } else if (ext === '.csv') {
      const content = fs.readFileSync(req.file.path, 'utf8');
      rows = csv.parse(content, { columns: true, skip_empty_lines: true });
    } else {
      return res.status(400).json({ message: 'Unsupported file type' });
    }
    const results = [];
    for (const r of rows) {
      const courseCode = (r.courseCode || r.code || '').trim();
      const courseName = (r.courseName || r.subject || '').trim();
      const hodEmail = (r.hodEmail || r.email || '').trim().toLowerCase();
      const hodName = (r.hodName || r.name || '').trim();
      let course = await Course.findOne(courseCode ? { courseCode } : { courseName });
      if (!course) { results.push({ status: 'skipped', reason: 'course not found', row: r }); continue; }
      let hod = null;
      if (hodEmail) hod = await User.findOne({ email: hodEmail, role: 'teacher_level1' });
      if (!hod && hodName) hod = await User.findOne({ name: new RegExp('^' + hodName + '$', 'i'), role: 'teacher_level1' });
      if (!hod) { results.push({ status: 'skipped', reason: 'hod not found', course: course.courseCode }); continue; }
      course.hod = hod._id;
      await course.save();
      results.push({ status: 'assigned', course: course.courseCode, hod: hod.email });
    }
    try { fs.unlink(req.file.path, () => {}); } catch {}
    res.json({ message: 'HOD assignments processed', results });
  } catch (e) {
    console.error('HOD upload error:', e);
    res.status(500).json({ message: 'Server error processing HOD assignments' });
  }
});

// ========== New: Enroll students to courses via CSV/XLSX ==========
// Columns: student (email|roll|name), courseCode|courseName
router.post('/enrollments/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const ext = path.extname(req.file.originalname).toLowerCase();
    let rows = [];
    if (ext === '.xlsx' || ext === '.xls') {
      const wb = XLSX.readFile(req.file.path);
      rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: '' });
    } else if (ext === '.csv') {
      const content = fs.readFileSync(req.file.path, 'utf8');
      rows = csv.parse(content, { columns: true, skip_empty_lines: true });
    } else {
      return res.status(400).json({ message: 'Unsupported file type' });
    }
    const results = [];
    for (const r of rows) {
      const ref = (r.student || r.email || r.roll || r.rollNumber || r.name || '').trim();
      const courseCode = (r.courseCode || r.code || '').trim();
      const courseName = (r.courseName || r.subject || '').trim();
      if (!ref) { results.push({ status: 'skipped', reason: 'missing student ref', row: r }); continue; }
      const course = await Course.findOne(courseCode ? { courseCode } : { courseName });
      if (!course) { results.push({ status: 'skipped', reason: 'course not found', row: r }); continue; }
      const lc = ref.toLowerCase();
      let student = await User.findOne({ email: lc });
      if (!student) student = await User.findOne({ rollNumber: ref });
      if (!student) student = await User.findOne({ name: new RegExp('^' + ref + '$', 'i') });
      if (!student) { results.push({ status: 'skipped', reason: 'student not found', course: course.courseCode }); continue; }
      if (!Array.isArray(course.students)) course.students = [];
      if (!course.students.find(id => id.toString() === student._id.toString())) {
        course.students.push(student._id);
        await course.save();
        results.push({ status: 'enrolled', course: course.courseCode, student: student.email || student.rollNumber });
      } else {
        results.push({ status: 'skipped', reason: 'already enrolled', course: course.courseCode, student: student.email || student.rollNumber });
      }
    }
    try { fs.unlink(req.file.path, () => {}); } catch {}
    res.json({ message: 'Enrollments processed', results });
  } catch (e) {
    console.error('Enrollments upload error:', e);
    res.status(500).json({ message: 'Server error processing enrollments' });
  }
});


