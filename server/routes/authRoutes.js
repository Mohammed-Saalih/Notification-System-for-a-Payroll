const express = require('express');
const controller = require('../controllers/authController');

const router = express.Router();

router.get('/users', controller.listUsers);
router.post('/login', controller.login);

module.exports = router;
