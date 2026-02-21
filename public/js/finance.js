async function initFinance() {
  const user = requireRole(['finance']);
  if (!user) return;
  document.getElementById('userName').textContent = user.name;

  let confirmToken = null;

  const accounts = await apiRequest('/api/finance/accounts');
  renderAccounts(accounts);

  const options = accounts
    .map((a) => `<option value="${a.id}">${a.name}</option>`)
    .join('');

  document.getElementById('fromAccount').innerHTML = options;
  document.getElementById('toAccount').innerHTML = options;

  const firstLedger = await apiRequest(`/api/finance/ledger/${accounts[0].id}`);
  renderLedger(firstLedger);

  document.getElementById('fromAccount').addEventListener('change', async (e) => {
    const ledger = await apiRequest(`/api/finance/ledger/${e.target.value}`);
    renderLedger(ledger);
  });

  document.getElementById('transferForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fromAccountId = document.getElementById('fromAccount').value;
    const toAccountId = document.getElementById('toAccount').value;
    const amount = document.getElementById('amount').value;

    const payload = { fromAccountId, toAccountId, amount };
    if (confirmToken) payload.confirmToken = confirmToken;

    const result = await apiRequest('/api/finance/transfer', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    if (result.requiresConfirmation) {
      confirmToken = result.confirmationToken;
      const okay = confirm('Confirm this GL transfer?');
      if (!okay) {
        confirmToken = null;
        return;
      }
      const confirmResult = await apiRequest('/api/finance/transfer', {
        method: 'POST',
        body: JSON.stringify({ fromAccountId, toAccountId, amount, confirmToken })
      });
      confirmToken = null;
      alert(`Transfer completed: ${confirmResult.referenceId}`);
    } else {
      alert(`Transfer completed: ${result.referenceId}`);
      confirmToken = null;
    }

    const refreshed = await apiRequest('/api/finance/accounts');
    renderAccounts(refreshed);
    const ledger = await apiRequest(`/api/finance/ledger/${fromAccountId}`);
    renderLedger(ledger);
    await loadNotificationsCount();
  });

  document.getElementById('logoutBtn').addEventListener('click', () => {
    clearCurrentUser();
    window.location.href = '/login.html';
  });

  await loadNotificationsCount();
  setInterval(loadNotificationsCount, 10000);
}

function renderAccounts(accounts) {
  document.getElementById('glCards').innerHTML = accounts
    .map(
      (acc) => `<div class="card">
        <h4>${acc.name}</h4>
        <p>Balance: ${acc.balance}</p>
        <p>Threshold: ${acc.threshold}</p>
        <span class="status ${acc.balance < acc.threshold ? 'warn' : 'ok'}">
          ${acc.balance < acc.threshold ? 'Below Threshold' : 'Healthy'}
        </span>
      </div>`
    )
    .join('');
}

function renderLedger(ledger) {
  document.getElementById('ledgerTable').innerHTML = ledger
    .slice(0, 20)
    .map(
      (row) => `<tr>
        <td>${row.id}</td>
        <td>${row.type}</td>
        <td>${row.amount}</td>
        <td>${row.referenceId}</td>
        <td>${new Date(row.timestamp).toLocaleString()}</td>
      </tr>`
    )
    .join('');
}

initFinance();
