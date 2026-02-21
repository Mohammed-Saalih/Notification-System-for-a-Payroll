const { generateId } = require('../utils/id');

const store = {
  users: [],
  payrollByEmployee: {},
  notifications: [],
  salaryRequests: [],
  glAccounts: [],
  pendingTransfers: {},
  jobStates: {},
  alertThrottle: {}
};

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createPayrollCycle(employeeId, cycleIndex = 1) {
  const basic = randomInt(35000, 90000);
  const hra = Math.round(basic * 0.2);
  const da = Math.round(basic * 0.1);
  const bonus = randomInt(1000, 10000);
  const gross = basic + hra + da + bonus;
  const itDeduction = Math.round(gross * randomInt(7, 16) / 100);
  const netSalary = gross - itDeduction;

  return {
    cycleId: `${employeeId}-C${cycleIndex}`,
    basic,
    hra,
    da,
    bonus,
    itDeduction,
    netSalary,
    timestamp: new Date(Date.now() - randomInt(1, 90) * 86400000).toISOString()
  };
}

function addNotification({
  title,
  message,
  sourceSystem,
  severity = 'low',
  roleTarget,
  relatedEntityId = null,
  escalationLevel = 0
}) {
  const notification = {
    id: generateId('notif'),
    title,
    message,
    sourceSystem,
    severity,
    roleTarget,
    relatedEntityId,
    timestamp: new Date().toISOString(),
    acknowledged: false,
    escalationLevel
  };
  store.notifications.unshift(notification);
  return notification;
}

function createLedgerEntry(type, amount, referenceId) {
  return {
    id: generateId('led'),
    type,
    amount,
    referenceId,
    timestamp: new Date(Date.now() - randomInt(1, 30) * 86400000).toISOString()
  };
}

function seedData() {
  if (store.users.length) return;

  const users = [
    { id: 'emp-1', name: 'Prof. Meera Rao', role: 'employee' },
    { id: 'emp-2', name: 'Prof. Daniel Peter', role: 'employee' },
    { id: 'emp-3', name: 'Asst. Prof. Kavya Sen', role: 'employee' },
    { id: 'emp-4', name: 'Asst. Prof. Imran Qureshi', role: 'employee' },
    { id: 'emp-5', name: 'Teaching Fellow Nisha', role: 'employee' },
    { id: 'emp-6', name: 'Teaching Fellow Arjun', role: 'employee' },
    { id: 'admin-1', name: 'Admin Priya', role: 'admin' },
    { id: 'admin-2', name: 'Admin Rohan', role: 'admin' },
    { id: 'fin-1', name: 'Finance Anika', role: 'finance' },
    { id: 'fin-2', name: 'Finance Kabir', role: 'finance' },
    { id: 'fin-3', name: 'Finance Isha', role: 'finance' }
  ];

  store.users = users;

  const employees = users.filter((u) => u.role === 'employee');
  employees.forEach((employee) => {
    store.payrollByEmployee[employee.id] = Array.from({ length: 6 }, (_, i) =>
      createPayrollCycle(employee.id, i + 1)
    ).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  });

  store.glAccounts = [
    {
      id: 'gl-ops',
      name: 'Operations Payroll GL',
      balance: 450000,
      threshold: 180000,
      ledger: []
    },
    {
      id: 'gl-tax',
      name: 'Tax Withholding GL',
      balance: 210000,
      threshold: 100000,
      ledger: []
    },
    {
      id: 'gl-reserve',
      name: 'Cash Reserve GL',
      balance: 700000,
      threshold: 250000,
      ledger: []
    }
  ];

  store.glAccounts.forEach((account) => {
    account.ledger.push(createLedgerEntry('credit', randomInt(15000, 45000), 'seed-credit'));
    account.ledger.push(createLedgerEntry('debit', randomInt(5000, 25000), 'seed-debit'));
    account.ledger.push(createLedgerEntry('transfer', randomInt(8000, 30000), 'seed-transfer'));
  });

  store.salaryRequests.push({
    id: generateId('req'),
    employeeId: 'emp-3',
    title: 'Salary Revision Request',
    message: 'Requesting a 7% revision based on additional responsibilities.',
    proposedIncrementPct: 7,
    timestamp: new Date(Date.now() - 2 * 86400000).toISOString(),
    status: 'pending'
  });

  addNotification({
    title: 'Employee Salary Revision Request',
    message: 'Asst. Prof. Kavya Sen submitted a salary revision request.',
    sourceSystem: 'Employee Portal',
    severity: 'medium',
    roleTarget: 'admin',
    relatedEntityId: 'emp-3',
    escalationLevel: 1
  });

  // Seeded fault-tolerance event to make the system feel already active at login.
  addNotification({
    title: 'Payroll Execution Failure',
    message: 'Payroll job failed on prior run. Retry policy engaged.',
    sourceSystem: 'Payroll Job Engine',
    severity: 'high',
    roleTarget: 'admin',
    relatedEntityId: 'job-payroll',
    escalationLevel: 2
  });

  addNotification({
    title: 'Branch Head Directive',
    message: 'Increase salary of Prof. Meera Rao by 5%.',
    sourceSystem: 'Branch Head Office',
    severity: 'medium',
    roleTarget: 'admin',
    relatedEntityId: 'emp-1',
    escalationLevel: 1
  });
}

module.exports = {
  store,
  seedData,
  addNotification,
  randomInt,
  createPayrollCycle,
  createLedgerEntry
};
