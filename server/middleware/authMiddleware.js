const { getUserById } = require('../services/authService');

function authMiddleware(req, res, next) {
  const userId = req.headers['x-user-id'] || req.query.userId;
  if (!userId) {
    return res.status(401).json({ message: 'User context missing.' });
  }
  const user = getUserById(userId);
  if (!user) {
    return res.status(401).json({ message: 'Invalid user.' });
  }
  req.user = user;
  return next();
}

module.exports = authMiddleware;
