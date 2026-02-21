function getCurrentUser() {
  const raw = localStorage.getItem('annaPayUser');
  return raw ? JSON.parse(raw) : null;
}

function setCurrentUser(user) {
  localStorage.setItem('annaPayUser', JSON.stringify(user));
}

function clearCurrentUser() {
  localStorage.removeItem('annaPayUser');
}

async function apiRequest(url, options = {}) {
  const user = getCurrentUser();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (user?.id) {
    headers['x-user-id'] = user.id;
  }

  const response = await fetch(url, { ...options, headers });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }
  return data;
}

function requireRole(allowed) {
  const user = getCurrentUser();
  if (!user || !allowed.includes(user.role)) {
    window.location.href = '/login.html';
    return null;
  }
  return user;
}

async function loadNotificationsCount() {
  const user = getCurrentUser();
  if (!user) return;
  const notifications = await apiRequest('/api/notifications');
  const unacked = notifications.filter((n) => !n.acknowledged).length;
  const badge = document.getElementById('notifCount');
  if (badge) badge.textContent = String(unacked);
}
