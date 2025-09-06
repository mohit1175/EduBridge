const router = require('express').Router();
const ctrl = require('../controllers/attendanceController');
const { authenticate, authorizeRoles } = require('../middleware/auth');

router.use(authenticate);

router.post('/mark', authorizeRoles('teacher', 'hod', 'admin'), ctrl.markAttendance);
router.get('/student/:id', ctrl.getStudentAttendance);
router.get('/course/:id', authorizeRoles('teacher', 'hod', 'admin'), ctrl.getCourseAttendance);

module.exports = router;