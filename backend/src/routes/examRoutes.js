const router = require('express').Router();
const ctrl = require('../controllers/examController');
const { authenticate, authorizeRoles } = require('../middleware/auth');

router.use(authenticate);

router.get('/', ctrl.listResults);
router.post('/result', authorizeRoles('teacher', 'hod', 'admin'), ctrl.addResult);
router.post('/upload-csv', authorizeRoles('teacher', 'hod', 'admin'), ctrl.uploadCsv);

module.exports = router;