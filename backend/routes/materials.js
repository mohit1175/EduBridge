const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { auth, authorize } = require('../middleware/auth');
const StudyMaterial = require('../models/StudyMaterial');
const Course = require('../models/Course');

const router = express.Router();

// Storage config: /uploads/materials/<courseId>/
const baseDir = path.join(__dirname, '..', 'uploads', 'materials');
if (!fs.existsSync(baseDir)) fs.mkdirSync(baseDir, { recursive: true });

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      const { courseId } = req.body;
      const dir = path.join(baseDir, courseId || 'misc');
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    } catch (e) {
      cb(e);
    }
  },
  filename: (req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}-${safe}`);
  }
});

const upload = multer({ storage, limits: { fileSize: Number(process.env.MAX_FILE_SIZE || 10 * 1024 * 1024) } });

// POST /api/materials - upload material (teacher/HOD)
router.post('/', auth, authorize('teacher_level1', 'teacher_level2'), upload.single('file'), async (req, res) => {
  try {
    const { title, description, courseId } = req.body;
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    // Only instructor or HOD can upload to this course
    if (req.user.role !== 'teacher_level1' && course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to upload for this course' });
    }

    const fileUrl = `/uploads/materials/${courseId}/${req.file.filename}`;
    const doc = await StudyMaterial.create({
      title,
      description,
      course: course._id,
      subjectName: course.courseName,
      fileName: req.file.originalname,
      fileUrl,
      mimeType: req.file.mimetype,
      size: req.file.size,
      uploadedBy: req.user._id,
    });
    res.status(201).json({ message: 'Material uploaded', material: doc });
  } catch (e) {
    console.error('Upload material error:', e);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/materials - list materials by subject/course
router.get('/', auth, async (req, res) => {
  try {
    const { courseId } = req.query;
    const query = { isActive: true };
    if (courseId) query.course = courseId;

    // Students see only their department/semester courses if filtering absent
    if (req.user.role === 'student' && !courseId) {
      const courses = await Course.find({ department: req.user.department, semester: req.user.semester }, '_id');
      query.course = { $in: courses.map(c => c._id) };
    }

    // Teachers see only their own courses if not HOD
    if (req.user.role === 'teacher_level2' && !courseId) {
      const courses = await Course.find({ instructor: req.user._id }, '_id');
      query.course = { $in: courses.map(c => c._id) };
    }

    const list = await StudyMaterial.find(query)
      .populate('course', 'courseName semester credits')
      .populate('uploadedBy', 'name email role')
      .sort({ createdAt: -1 });
    res.json(list);
  } catch (e) {
    console.error('List materials error:', e);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/materials/:id/file - stream file (avoids static path issues)
router.get('/:id/file', auth, async (req, res) => {
  try {
  const doc = await StudyMaterial.findById(req.params.id).populate('course', 'instructor');
    if (!doc) return res.status(404).json({ message: 'File not found' });

    // Authorization: students can access if in same dept/semester scope (already enforced in list),
    // teachers can access their own uploads or HOD any
    if (req.user.role === 'teacher_level2' && doc.uploadedBy.toString() !== req.user._id.toString()) {
      // allow if it's their course
      const isInstructor = await Course.exists({ _id: doc.course._id, instructor: req.user._id });
      if (!isInstructor) return res.status(403).json({ message: 'Not authorized' });
    }

    // Resolve file path robustly
    const storedName = path.basename(doc.fileUrl || '');
    const courseId = (doc.course && doc.course._id ? doc.course._id : doc.course || '').toString();
    const candidates = [];
    // From fileUrl relative to backend root
    if (doc.fileUrl) {
      const rel = (doc.fileUrl || '').replace(/^\//, '');
      candidates.push(path.join(__dirname, '..', rel));
    }
    // From known baseDir + course folder
    candidates.push(path.join(baseDir, courseId || 'misc', storedName));
    // From uploads root and all first-level subfolders
    const uploadsRoot = path.join(__dirname, '..', 'uploads');
    candidates.push(path.join(uploadsRoot, storedName));
    try {
      const top = fs.readdirSync(uploadsRoot);
      for (const entry of top) {
        const p = path.join(uploadsRoot, entry, storedName);
        candidates.push(p);
      }
    } catch {}
    // As a fallback, any matching filename under baseDir (first hit)
    try {
      const subdirs = fs.readdirSync(baseDir).map(d => path.join(baseDir, d));
      for (const dir of subdirs) {
        const p = path.join(dir, storedName);
        candidates.push(p);
      }
    } catch {}

    const existing = candidates.find(p => p && fs.existsSync(p));
    if (!existing) return res.status(404).json({ message: 'File not found' });
    res.type(doc.mimeType);
    res.sendFile(existing);
  } catch (e) {
    console.error('Get material file error:', e);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
