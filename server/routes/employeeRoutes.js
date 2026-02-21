const express = require('express');
const controller = require('../controllers/employeeController');
const authMiddleware = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(authMiddleware, requireRole('employee'));
router.get('/payroll', controller.getPayrollHistory);
router.get('/salary-details', controller.getSalaryDetails);
router.post('/revision-request', controller.submitRevisionRequest);

module.exports = router;
