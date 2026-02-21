const { store } = require('../data/store');

function listUsers() {
  return store.users;
}

function login(userId) {
  const user = store.users.find((u) => u.id === userId);
  if (!user) return null;

  const redirectMap = {
    employee: '/employee.html',
    admin: '/admin.html',
    finance: '/finance.html'
  };

  return { user, redirectTo: redirectMap[user.role] || '/login.html' };
}

function getUserById(userId) {
  return store.users.find((u) => u.id === userId) || null;
}

module.exports = { listUsers, login, getUserById };
