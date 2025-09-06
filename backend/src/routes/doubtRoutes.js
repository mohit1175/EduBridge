const router = require('express').Router();
const ctrl = require('../controllers/doubtController');
const { authenticate, authorizeRoles } = require('../middleware/auth');

router.use(authenticate);

router.get('/', ctrl.listDoubts);
router.post('/', authorizeRoles('student'), ctrl.createDoubt);
router.put('/:id/answer', authorizeRoles('teacher', 'hod', 'admin'), ctrl.answerDoubt);

module.exports = router;