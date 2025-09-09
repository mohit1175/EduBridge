const express = require('express');
const { body, validationResult } = require('express-validator');
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/attendance
// @desc    Get attendance records
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { student, course, date, semester, startDate, endDate } = req.query;
    let query = {};

    // Students can only see their own attendance
    if (req.user.role === 'student') {
      query.student = req.user._id;
    } else if (student) {
      query.student = student;
    }

    if (course) query.course = course;
    if (semester) query.semester = parseInt(semester);
    
    if (date) {
      const targetDate = new Date(date);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);
      query.date = { $gte: targetDate, $lt: nextDay };
    }

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const attendance = await Attendance.find(query)
      .populate('student', 'name rollNumber')
      .populate('markedBy', 'name email')
      .sort({ date: -1 });

    res.json(attendance);
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/attendance
// @desc    Mark attendance
// @access  Private (Teachers)
router.post('/', auth, authorize('teacher_level1', 'teacher_level2'), [
  body('student').isMongoId().withMessage('Valid student ID required'),
  body('course').trim().notEmpty().withMessage('Course is required'),
  body('status').isIn(['present', 'absent', 'late']).withMessage('Invalid attendance status'),
  body('date').optional().isISO8601().withMessage('Valid date required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { student, course, status, date, remarks, semester } = req.body;

    // Check if student exists
    const studentExists = await User.findById(student);
    if (!studentExists) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const attendanceDate = date ? new Date(date) : new Date();
    
    // Check if attendance already marked for this student, course, and date
    const existingAttendance = await Attendance.findOne({
      student,
      course,
      date: {
        $gte: new Date(attendanceDate.getFullYear(), attendanceDate.getMonth(), attendanceDate.getDate()),
        $lt: new Date(attendanceDate.getFullYear(), attendanceDate.getMonth(), attendanceDate.getDate() + 1)
      }
    });

    if (existingAttendance) {
      return res.status(400).json({ message: 'Attendance already marked for this student on this date' });
    }

    const attendance = new Attendance({
      student,
      course,
      status,
      date: attendanceDate,
      semester: semester || studentExists.semester,
      markedBy: req.user._id,
      remarks
    });

    await attendance.save();
    await attendance.populate('student', 'name rollNumber');
    await attendance.populate('markedBy', 'name email');

    res.status(201).json({
      message: 'Attendance marked successfully',
      attendance
    });
  } catch (error) {
    console.error('Mark attendance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/attendance/:id
// @desc    Update attendance record
// @access  Private (Teachers)
router.put('/:id', auth, authorize('teacher_level1', 'teacher_level2'), async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id);
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    // Check if user marked this attendance or is admin
    if (attendance.markedBy.toString() !== req.user._id.toString() && req.user.role !== 'teacher_level1') {
      return res.status(403).json({ message: 'Not authorized to update this attendance record' });
    }

    const updatedAttendance = await Attendance.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    .populate('student', 'name rollNumber')
    .populate('markedBy', 'name email');

    res.json({
      message: 'Attendance updated successfully',
      attendance: updatedAttendance
    });
  } catch (error) {
    console.error('Update attendance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/attendance/:id
// @desc    Delete attendance record
// @access  Private (Teachers)
router.delete('/:id', auth, authorize('teacher_level1', 'teacher_level2'), async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id);
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    // Check if user marked this attendance or is admin
    if (attendance.markedBy.toString() !== req.user._id.toString() && req.user.role !== 'teacher_level1') {
      return res.status(403).json({ message: 'Not authorized to delete this attendance record' });
    }

    await Attendance.findByIdAndDelete(req.params.id);

    res.json({ message: 'Attendance record deleted successfully' });
  } catch (error) {
    console.error('Delete attendance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/attendance/bulk
// @desc    Mark attendance for multiple students
// @access  Private (Teachers)
router.post('/bulk', auth, authorize('teacher_level1', 'teacher_level2'), [
  body('attendanceRecords').isArray().withMessage('Attendance records must be an array'),
  body('attendanceRecords.*.student').isMongoId().withMessage('Valid student ID required'),
  body('attendanceRecords.*.course').trim().notEmpty().withMessage('Course is required'),
  body('attendanceRecords.*.status').isIn(['present', 'absent', 'late']).withMessage('Invalid attendance status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { attendanceRecords, date, semester } = req.body;
    const attendanceDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(attendanceDate.getFullYear(), attendanceDate.getMonth(), attendanceDate.getDate());
    const endOfDay = new Date(attendanceDate.getFullYear(), attendanceDate.getMonth(), attendanceDate.getDate() + 1);

    // Upsert per (student, course, day)
    const ops = attendanceRecords.map(r => ({
      updateOne: {
        filter: {
          student: r.student,
          course: r.course,
          date: { $gte: startOfDay, $lt: endOfDay }
        },
        update: {
          $set: {
            student: r.student,
            course: r.course,
            status: r.status,
            date: attendanceDate,
            semester: semester || r.semester,
            markedBy: req.user._id
          }
        },
        upsert: true
      }
    }));

    const result = await Attendance.bulkWrite(ops, { ordered: false });

    res.status(201).json({
      message: 'Bulk attendance marked successfully',
      result
    });
  } catch (error) {
    console.error('Bulk attendance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/attendance/stats
// @desc    Get attendance statistics
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    const { student, course, semester, startDate, endDate } = req.query;
    let matchQuery = {};

    if (req.user.role === 'student') {
      matchQuery.student = req.user._id;
    } else if (student) {
      matchQuery.student = student;
    }

    if (course) matchQuery.course = course;
    if (semester) matchQuery.semester = parseInt(semester);
    
    if (startDate && endDate) {
      matchQuery.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const stats = await Attendance.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
          absent: { $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] } },
          late: { $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] } }
        }
      }
    ]);

    const courseStats = await Attendance.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$course',
          total: { $sum: 1 },
          present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
          absent: { $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] } },
          late: { $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] } }
        }
      }
    ]);

    const result = {
      overall: stats[0] || { total: 0, present: 0, absent: 0, late: 0 },
      byCourse: courseStats
    };

    // Calculate percentages
    if (result.overall.total > 0) {
      result.overall.presentPercentage = Math.round((result.overall.present / result.overall.total) * 100);
      result.overall.absentPercentage = Math.round((result.overall.absent / result.overall.total) * 100);
      result.overall.latePercentage = Math.round((result.overall.late / result.overall.total) * 100);
    }

    res.json(result);
  } catch (error) {
    console.error('Get attendance stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
