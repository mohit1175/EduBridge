const express = require('express');
const { body, validationResult } = require('express-validator');
const Timetable = require('../models/Timetable');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/timetable
// @desc    Get timetable
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { day, course, semester, instructor } = req.query;
    let query = { isActive: true };

    if (day) query.day = day;
    if (course) query.course = course;
    if (semester) query.semester = parseInt(semester);

    // Role-based scoping
    if (req.user.role === 'teacher_level2') {
      // Teacher: see only own timetable; ignore explicit instructor param
      query.instructor = req.user._id;
    } else if (req.user.role === 'student') {
      // Student: see by their semester (and optionally department in future)
      query.semester = req.user.semester;
    } else if (instructor) {
      query.instructor = instructor;
    }

    const timetable = await Timetable.find(query)
      .populate('instructor', 'name email')
      .sort({ day: 1, startTime: 1 });

    res.json(timetable);
  } catch (error) {
    console.error('Get timetable error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/timetable
// @desc    Create a new timetable entry
// @access  Private (Teachers)
// Only HOD can create timetable entries
router.post('/', auth, authorize('teacher_level1'), [
  body('course').trim().notEmpty().withMessage('Course is required'),
  body('day').optional().isIn(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']).withMessage('Valid day is required'),
  body('days').optional().isArray().withMessage('days must be an array'),
  body('days.*').optional().isIn(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']).withMessage('Invalid day in days array'),
  body('startTime').trim().notEmpty().withMessage('Start time is required'),
  body('endTime').trim().notEmpty().withMessage('End time is required'),
  body('room').trim().notEmpty().withMessage('Room is required'),
  body('semester').isInt({ min: 1, max: 8 }).withMessage('Semester must be between 1 and 8')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Support multiple days in one request
    const { days } = req.body;
    const instructor = req.body.instructor || req.user._id;
    const base = { ...req.body, instructor };
    if (!base.term) base.term = base.semester; // align term with semester if not given

    let created;
    if (Array.isArray(days) && days.length) {
      const payloads = days.map(d => ({ ...base, day: d }));
      created = await Timetable.insertMany(payloads);
    } else {
      const timetable = new Timetable(base);
      created = [await timetable.save()];
    }
    // populate instructor for response (only for first to keep payload small)
    await Timetable.populate(created, { path: 'instructor', select: 'name email' });
    res.status(201).json({ message: 'Timetable entry(ies) created successfully', count: created.length, entries: created });
  } catch (error) {
    console.error('Create timetable error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/timetable/:id
// @desc    Update a timetable entry
// @access  Private (HOD)
router.put('/:id', auth, authorize('teacher_level1'), async (req, res) => {
  try {
    const timetable = await Timetable.findById(req.params.id);
    if (!timetable) {
      return res.status(404).json({ message: 'Timetable entry not found' });
    }

  // Only HOD can update

    const updatedTimetable = await Timetable.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('instructor', 'name email');

    res.json({
      message: 'Timetable entry updated successfully',
      timetable: updatedTimetable
    });
  } catch (error) {
    console.error('Update timetable error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/timetable/:id
// @desc    Delete a timetable entry
// @access  Private (HOD)
router.delete('/:id', auth, authorize('teacher_level1'), async (req, res) => {
  try {
    const timetable = await Timetable.findById(req.params.id);
    if (!timetable) {
      return res.status(404).json({ message: 'Timetable entry not found' });
    }

  // Only HOD can delete

    // Soft delete by setting isActive to false
    timetable.isActive = false;
    await timetable.save();

    res.json({ message: 'Timetable entry deleted successfully' });
  } catch (error) {
    console.error('Delete timetable error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/timetable/week
// @desc    Get weekly timetable
// @access  Private
router.get('/week', auth, async (req, res) => {
  try {
    const { semester, course } = req.query;
    let query = { isActive: true };

    if (course) query.course = course;
    if (req.user.role === 'teacher_level2') {
      query.instructor = req.user._id;
    } else if (req.user.role === 'student') {
      query.semester = req.user.semester;
    } else if (semester) {
      query.semester = parseInt(semester);
    }

    const timetable = await Timetable.find(query)
      .populate('instructor', 'name email')
      .sort({ day: 1, startTime: 1 });

    // Group by day
    const weeklyTimetable = {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: [],
      Sunday: []
    };

    timetable.forEach(entry => {
      weeklyTimetable[entry.day].push(entry);
    });

    res.json(weeklyTimetable);
  } catch (error) {
    console.error('Get weekly timetable error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
