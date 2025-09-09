const express = require('express');
const { body, validationResult } = require('express-validator');
const Doubt = require('../models/Doubt');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/doubts
// @desc    Get doubts
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { status, course, priority, student, assignedTo } = req.query;
    let query = {};

    // Students can only see their own doubts
    if (req.user.role === 'student') {
      query.student = req.user._id;
    } else if (student) {
      query.student = student;
    }

    if (status) query.status = status;
    if (course) query.course = course;
    if (priority) query.priority = priority;
    if (assignedTo) query.assignedTo = assignedTo;

    const doubts = await Doubt.find(query)
      .populate('student', 'name rollNumber email')
      .populate('answeredBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(doubts);
  } catch (error) {
    console.error('Get doubts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/doubts
// @desc    Create a new doubt
// @access  Private (Students)
router.post('/', auth, authorize('student'), [
  body('course').trim().notEmpty().withMessage('Course is required'),
  body('subject').trim().notEmpty().withMessage('Subject is required'),
  body('question').trim().notEmpty().withMessage('Question is required'),
  body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid priority level'),
  body('category').optional().isIn(['attendance', 'marks', 'timetable', 'other']).withMessage('Invalid category'),
  body('assignedTo').optional().isMongoId().withMessage('Invalid teacher id')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const doubt = new Doubt({
      ...req.body,
      student: req.user._id
    });

    await doubt.save();
    await doubt.populate('student', 'name rollNumber email');

    res.status(201).json({
      message: 'Doubt submitted successfully',
      doubt
    });
  } catch (error) {
    console.error('Create doubt error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/doubts/:id/answer
// @desc    Answer a doubt
// @access  Private (Teachers)
router.put('/:id/answer', auth, authorize('teacher_level1', 'teacher_level2'), [
  body('answer').trim().notEmpty().withMessage('Answer is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const doubt = await Doubt.findById(req.params.id);
    if (!doubt) {
      return res.status(404).json({ message: 'Doubt not found' });
    }

    if (doubt.status === 'resolved') {
      return res.status(400).json({ message: 'This doubt is already resolved' });
    }

    doubt.answer = req.body.answer;
    doubt.answeredBy = req.user._id;
    doubt.answeredAt = new Date();
    doubt.status = 'answered';

    await doubt.save();
    await doubt.populate('student', 'name rollNumber email');
    await doubt.populate('answeredBy', 'name email');

    res.json({
      message: 'Doubt answered successfully',
      doubt
    });
  } catch (error) {
    console.error('Answer doubt error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/doubts/:id/resolve
// @desc    Mark doubt as resolved
// @access  Private (Teachers)
router.put('/:id/resolve', auth, authorize('teacher_level1', 'teacher_level2'), async (req, res) => {
  try {
    const doubt = await Doubt.findById(req.params.id);
    if (!doubt) {
      return res.status(404).json({ message: 'Doubt not found' });
    }

    if (doubt.status !== 'answered') {
      return res.status(400).json({ message: 'Doubt must be answered before resolving' });
    }

    doubt.status = 'resolved';
    await doubt.save();
    await doubt.populate('student', 'name rollNumber email');
    await doubt.populate('answeredBy', 'name email');

    res.json({
      message: 'Doubt marked as resolved',
      doubt
    });
  } catch (error) {
    console.error('Resolve doubt error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/doubts/:id
// @desc    Update a doubt
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const doubt = await Doubt.findById(req.params.id);
    if (!doubt) {
      return res.status(404).json({ message: 'Doubt not found' });
    }

    // Students can only update their own doubts if not answered
    if (req.user.role === 'student') {
      if (doubt.student.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to update this doubt' });
      }
      if (doubt.status !== 'pending') {
        return res.status(400).json({ message: 'Cannot update answered or resolved doubts' });
      }
    }

    // Teachers can update any doubt
    if (req.user.role !== 'student' && doubt.student.toString() !== req.user._id.toString()) {
      // Only allow updating answer-related fields for teachers
      const allowedFields = ['answer', 'status'];
      const updateData = {};
      Object.keys(req.body).forEach(key => {
        if (allowedFields.includes(key)) {
          updateData[key] = req.body[key];
        }
      });
      
      if (req.body.answer) {
        updateData.answeredBy = req.user._id;
        updateData.answeredAt = new Date();
      }
      
      const updatedDoubt = await Doubt.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      )
      .populate('student', 'name rollNumber email')
      .populate('answeredBy', 'name email');

      return res.json({
        message: 'Doubt updated successfully',
        doubt: updatedDoubt
      });
    }

    // For students updating their own doubts
    const updatedDoubt = await Doubt.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    .populate('student', 'name rollNumber email')
    .populate('answeredBy', 'name email');

    res.json({
      message: 'Doubt updated successfully',
      doubt: updatedDoubt
    });
  } catch (error) {
    console.error('Update doubt error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/doubts/:id
// @desc    Delete a doubt
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const doubt = await Doubt.findById(req.params.id);
    if (!doubt) {
      return res.status(404).json({ message: 'Doubt not found' });
    }

    // Students can only delete their own pending doubts
    if (req.user.role === 'student') {
      if (doubt.student.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to delete this doubt' });
      }
      if (doubt.status !== 'pending') {
        return res.status(400).json({ message: 'Cannot delete answered or resolved doubts' });
      }
    }

    await Doubt.findByIdAndDelete(req.params.id);

    res.json({ message: 'Doubt deleted successfully' });
  } catch (error) {
    console.error('Delete doubt error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/doubts/stats
// @desc    Get doubt statistics
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    let matchQuery = {};

    if (req.user.role === 'student') {
      matchQuery.student = req.user._id;
    }

    const stats = await Doubt.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          answered: { $sum: { $cond: [{ $eq: ['$status', 'answered'] }, 1, 0] } },
          resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } }
        }
      }
    ]);

    const courseStats = await Doubt.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$course',
          total: { $sum: 1 },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          answered: { $sum: { $cond: [{ $eq: ['$status', 'answered'] }, 1, 0] } },
          resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } }
        }
      }
    ]);

    const result = {
      overall: stats[0] || { total: 0, pending: 0, answered: 0, resolved: 0 },
      byCourse: courseStats
    };

    res.json(result);
  } catch (error) {
    console.error('Get doubt stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
