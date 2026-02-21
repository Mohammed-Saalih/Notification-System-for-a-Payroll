async function initEmployee() {
  const user = requireRole(['employee']);
  if (!user) return;
  document.getElementById('userName').textContent = user.name;

  const payroll = await apiRequest('/api/employee/payroll');
  const latest = await apiRequest('/api/employee/salary-details');

  const tbody = document.getElementById('payrollTable');
  tbody.innerHTML = payroll
    .map(
      (p) => `<tr>
        <td>${p.cycleId}</td>
        <td>${p.basic}</td>
        <td>${p.hra}</td>
        <td>${p.da}</td>
        <td>${p.bonus}</td>
        <td>${p.itDeduction}</td>
        <td>${p.netSalary}</td>
      </tr>`
    )
    .join('');

  document.getElementById('salaryDetails').innerHTML = latest
    ? `<div class="stack">
        <div>Basic: ${latest.basic}</div>
        <div>HRA: ${latest.hra}</div>
        <div>DA: ${latest.da}</div>
        <div>Bonus: ${latest.bonus}</div>
        <div>Tax Deduction: ${latest.itDeduction}</div>
        <div><strong>Net Salary: ${latest.netSalary}</strong></div>
      </div>`
    : 'No data available';

  document.getElementById('revisionForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('reqTitle').value;
    const message = document.getElementById('reqMessage').value;
    const proposedIncrementPct = document.getElementById('reqPct').value;

    await apiRequest('/api/employee/revision-request', {
      method: 'POST',
      body: JSON.stringify({ title, message, proposedIncrementPct })
    });

    alert('Salary revision request submitted to admin.');
    e.target.reset();
    await loadNotificationsCount();
  });

  document.getElementById('logoutBtn').addEventListener('click', () => {
    clearCurrentUser();
    window.location.href = '/login.html';
  });

  await loadNotificationsCount();
  setInterval(loadNotificationsCount, 10000);
}

initEmployee();
