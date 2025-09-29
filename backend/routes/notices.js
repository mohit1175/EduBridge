const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { auth, authorize } = require('../middleware/auth');
const Notice = require('../models/Notice');

const router = express.Router();

// Storage for notice attachments
const uploadDir = path.join(__dirname, '..', 'uploads', 'notices');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

// List notices for any authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const role = req.user?.role || 'student';
    const now = new Date();
    const q = {
      published: true,
      $or: [ { visibleTo: 'all' }, { visibleTo: role } ],
      $or2: [{ expiresAt: null }, { expiresAt: { $exists: false } }, { expiresAt: { $gt: now } }]
    };
    // Mongo doesn't support $or2; merge with $or
    const query = { published: true, $and: [ { $or: [ { visibleTo: 'all' }, { visibleTo: role } ] }, { $or: [ { expiresAt: null }, { expiresAt: { $exists: false } }, { expiresAt: { $gt: now } } ] } ] };
    const { limit = 20 } = req.query;
    const notices = await Notice.find(query).sort({ createdAt: -1 }).limit(Number(limit)).lean();
    res.json({ notices });
  } catch (e) {
    console.error('Get notices error:', e);
    res.status(500).json({ message: 'Server error getting notices' });
  }
});

// Admin list all notices
router.get('/admin', auth, authorize('admin'), async (req, res) => {
  try {
    const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 5));
    const page = Math.max(1, Number(req.query.page) || 1);
    const total = await Notice.countDocuments({});
    const notices = await Notice.find({})
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
    const pages = Math.max(1, Math.ceil(total / limit));
    res.json({ notices, page, limit, total, pages });
  } catch (e) {
    console.error('Admin get notices error:', e);
    res.status(500).json({ message: 'Server error getting notices' });
  }
});

// Create a notice (admin)
router.post('/', auth, authorize('admin'), upload.array('files', 10), async (req, res) => {
  try {
    const { title, description = '', visibleTo = 'all', published = 'true', expiresAt } = req.body;
    if (!title || !title.trim()) return res.status(400).json({ message: 'Title is required' });
    const roles = Array.isArray(visibleTo) ? visibleTo : String(visibleTo).split(',').map(s => s.trim()).filter(Boolean);
    const attachments = (req.files || []).map(f => ({ filename: f.originalname, url: `/uploads/notices/${path.basename(f.path)}`, mimetype: f.mimetype, size: f.size }));
    const notice = await Notice.create({
      title: title.trim(),
      description,
      attachments,
      visibleTo: roles.length ? roles : ['all'],
      published: String(published) !== 'false',
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      createdBy: req.user._id,
    });
    res.json({ message: 'Notice created', notice });
  } catch (e) {
    console.error('Create notice error:', e);
    res.status(500).json({ message: 'Server error creating notice' });
  }
});

// Update a notice (admin)
router.put('/:id', auth, authorize('admin'), upload.array('files', 10), async (req, res) => {
  try {
    const { title, description, visibleTo, published, expiresAt, removeAttachmentUrls } = req.body;
    const notice = await Notice.findById(req.params.id);
    if (!notice) return res.status(404).json({ message: 'Notice not found' });
    if (title !== undefined) notice.title = title;
    if (description !== undefined) notice.description = description;
    if (visibleTo !== undefined) {
      const roles = Array.isArray(visibleTo) ? visibleTo : String(visibleTo).split(',').map(s => s.trim()).filter(Boolean);
      notice.visibleTo = roles.length ? roles : ['all'];
    }
    if (published !== undefined) notice.published = String(published) !== 'false';
    if (expiresAt !== undefined) notice.expiresAt = expiresAt ? new Date(expiresAt) : undefined;
    // Remove selected attachments by url
    if (removeAttachmentUrls) {
      const toRemove = Array.isArray(removeAttachmentUrls) ? removeAttachmentUrls : String(removeAttachmentUrls).split(',').map(s => s.trim()).filter(Boolean);
      notice.attachments = (notice.attachments || []).filter(a => !toRemove.includes(a.url));
    }
    // Add new files
    const newAtt = (req.files || []).map(f => ({ filename: f.originalname, url: `/uploads/notices/${path.basename(f.path)}`, mimetype: f.mimetype, size: f.size }));
    notice.attachments = [...(notice.attachments || []), ...newAtt];
    await notice.save();
    res.json({ message: 'Notice updated', notice });
  } catch (e) {
    console.error('Update notice error:', e);
    res.status(500).json({ message: 'Server error updating notice' });
  }
});

// Delete a notice (admin)
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const n = await Notice.findByIdAndDelete(req.params.id);
    if (!n) return res.status(404).json({ message: 'Notice not found' });
    res.json({ message: 'Notice deleted' });
  } catch (e) {
    console.error('Delete notice error:', e);
    res.status(500).json({ message: 'Server error deleting notice' });
  }
});

module.exports = router;
