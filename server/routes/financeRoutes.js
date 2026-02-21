const express = require('express');
const controller = require('../controllers/financeController');
const authMiddleware = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(authMiddleware, requireRole('finance'));
router.get('/accounts', controller.getAccounts);
router.get('/ledger/:accountId', controller.getLedger);
router.post('/transfer', controller.transfer);

module.exports = router;
