async function initNotifications() {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = '/login.html';
    return;
  }

  document.getElementById('userName').textContent = user.name;
  document.getElementById('backLink').href =
    user.role === 'employee' ? '/employee.html' : user.role === 'admin' ? '/admin.html' : '/finance.html';

  async function load() {
    const notifications = await apiRequest('/api/notifications');
    document.getElementById('notificationTable').innerHTML = notifications
      .map(
        (n) => `<tr>
          <td>${n.title}</td>
          <td>${n.message}</td>
          <td>${n.sourceSystem}</td>
          <td>${n.severity}</td>
          <td>${n.escalationLevel}</td>
          <td>${new Date(n.timestamp).toLocaleString()}</td>
          <td>${n.acknowledged ? 'Yes' : `<button onclick="ack('${n.id}')">Acknowledge</button>`}</td>
        </tr>`
      )
      .join('');
  }

  window.ack = async function ack(id) {
    await apiRequest(`/api/notifications/${id}/ack`, { method: 'POST' });
    await load();
  };

  document.getElementById('logoutBtn').addEventListener('click', () => {
    clearCurrentUser();
    window.location.href = '/login.html';
  });

  await load();
  setInterval(load, 10000);
}

initNotifications();
