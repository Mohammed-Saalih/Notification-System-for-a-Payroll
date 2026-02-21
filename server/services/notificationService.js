const { store, addNotification } = require('../data/store');

function shouldThrottle(key, windowMs = 15000) {
  const now = Date.now();
  const last = store.alertThrottle[key] || 0;
  if (now - last < windowMs) return true;
  store.alertThrottle[key] = now;
  return false;
}

function createNotification(payload) {
  return addNotification(payload);
}

function getNotificationsForUser(user) {
  return store.notifications.filter((n) => {
    if (n.roleTarget === user.role) return true;
    if (n.roleTarget === `employee:${user.id}`) return true;
    return false;
  });
}

function acknowledgeNotification(user, notificationId) {
  const notifications = getNotificationsForUser(user);
  const notification = notifications.find((n) => n.id === notificationId);
  if (!notification) {
    return { success: false, message: 'Notification not found for this role/user.' };
  }
  notification.acknowledged = true;
  return { success: true, notification };
}

module.exports = {
  shouldThrottle,
  createNotification,
  getNotificationsForUser,
  acknowledgeNotification
};
