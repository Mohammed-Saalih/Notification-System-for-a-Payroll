const authService = require('../services/authService');

function listUsers(req, res) {
  return res.json(authService.listUsers());
}

function login(req, res) {
  const { userId } = req.body;
  const result = authService.login(userId);
  if (!result) {
    return res.status(404).json({ message: 'User not found.' });
  }
  return res.json(result);
}

module.exports = { listUsers, login };
