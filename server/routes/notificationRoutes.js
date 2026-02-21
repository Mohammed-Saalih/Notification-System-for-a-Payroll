const express = require('express');
const controller = require('../controllers/notificationController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);
router.get('/', controller.listNotifications);
router.post('/:id/ack', controller.acknowledge);

module.exports = router;
