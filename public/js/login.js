async function initLogin() {
  const select = document.getElementById('userSelect');
  const users = await fetch('/api/auth/users').then((r) => r.json());

  users.forEach((user) => {
    const option = document.createElement('option');
    option.value = user.id;
    option.textContent = `${user.name} (${user.role})`;
    select.appendChild(option);
  });

  document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const userId = select.value;

    const result = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    }).then((r) => r.json());

    if (!result.user) {
      alert(result.message || 'Login failed');
      return;
    }

    setCurrentUser(result.user);
    window.location.href = result.redirectTo;
  });
}

initLogin();
