const router = require('express').Router();
const ctrl = require('../controllers/courseController');
const { authenticate, authorizeRoles } = require('../middleware/auth');

router.use(authenticate);

router.get('/mine', ctrl.myCourses);
router.get('/', ctrl.listCourses);
router.get('/:id', ctrl.getCourse);

router.post('/', authorizeRoles('admin', 'hod'), ctrl.createCourse);
router.put('/:id', authorizeRoles('admin', 'hod'), ctrl.updateCourse);
router.delete('/:id', authorizeRoles('admin', 'hod'), ctrl.deleteCourse);

router.post('/:id/assign-teacher', authorizeRoles('admin', 'hod'), ctrl.assignTeacher);
router.post('/:id/enroll-student', authorizeRoles('admin', 'hod'), ctrl.enrollStudent);

module.exports = router;