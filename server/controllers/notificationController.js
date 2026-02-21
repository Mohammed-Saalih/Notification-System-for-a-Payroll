const notificationService = require('../services/notificationService');

function listNotifications(req, res) {
  return res.json(notificationService.getNotificationsForUser(req.user));
}

function acknowledge(req, res) {
  const result = notificationService.acknowledgeNotification(req.user, req.params.id);
  if (!result.success) {
    return res.status(404).json(result);
  }
  return res.json(result);
}

module.exports = { listNotifications, acknowledge };
