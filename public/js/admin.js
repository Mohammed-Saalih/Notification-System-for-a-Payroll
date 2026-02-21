async function initAdmin() {
  const user = requireRole(['admin']);
  if (!user) return;
  document.getElementById('userName').textContent = user.name;

  const employees = await apiRequest('/api/admin/employees');
  const requests = await apiRequest('/api/admin/requests');
  const alerts = await apiRequest('/api/admin/system-alerts');

  document.getElementById('employeeList').innerHTML = employees
    .map((e) => `<li>${e.name} (${e.id})</li>`)
    .join('');

  const employeeSelect = document.getElementById('employeeSelect');
  employeeSelect.innerHTML = employees
    .map((e) => `<option value="${e.id}">${e.name}</option>`)
    .join('');

  document.getElementById('requestTable').innerHTML = requests
    .map(
      (r) => `<tr>
        <td>${r.employeeId}</td>
        <td>${r.title}</td>
        <td>${r.proposedIncrementPct || '-'}%</td>
        <td>${r.status}</td>
      </tr>`
    )
    .join('');

  document.getElementById('alertsList').innerHTML = alerts
    .slice(0, 12)
    .map((a) => `<li>[${a.severity.toUpperCase()}] ${a.title} - ${a.message}</li>`)
    .join('');

  document.getElementById('salaryForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const employeeId = document.getElementById('employeeSelect').value;
    const percentage = document.getElementById('percentage').value;

    const result = await apiRequest('/api/admin/modify-salary', {
      method: 'POST',
      body: JSON.stringify({ employeeId, percentage })
    });

    alert(`Salary updated for ${result.employee.name}.`);
    await loadNotificationsCount();
  });

  document.getElementById('logoutBtn').addEventListener('click', () => {
    clearCurrentUser();
    window.location.href = '/login.html';
  });

  await loadNotificationsCount();
  setInterval(loadNotificationsCount, 10000);
}

initAdmin();
