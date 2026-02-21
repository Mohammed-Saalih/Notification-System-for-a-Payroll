const express = require('express');
const controller = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(authMiddleware, requireRole('admin'));
router.get('/employees', controller.listEmployees);
router.get('/requests', controller.listRequests);
router.post('/modify-salary', controller.modifySalary);
router.get('/system-alerts', controller.systemAlerts);

module.exports = router;
