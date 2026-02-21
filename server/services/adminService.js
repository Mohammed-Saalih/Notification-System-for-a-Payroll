const { store } = require('../data/store');
const { createNotification } = require('./notificationService');

function listEmployees() {
  return store.users.filter((u) => u.role === 'employee');
}

function listRequests() {
  return store.salaryRequests;
}

function modifyEmployeeSalary({ employeeId, percentage, adminUser }) {
  const employee = store.users.find((u) => u.id === employeeId && u.role === 'employee');
  if (!employee) {
    return { success: false, message: 'Employee not found.' };
  }

  const increment = Number(percentage);
  if (Number.isNaN(increment) || increment <= -50 || increment > 100) {
    return { success: false, message: 'Invalid salary adjustment percentage.' };
  }

  const cycles = store.payrollByEmployee[employeeId] || [];
  if (!cycles.length) {
    return { success: false, message: 'No payroll history for employee.' };
  }

  const latest = { ...cycles[0] };
  latest.basic = Math.round(latest.basic * (1 + increment / 100));
  latest.hra = Math.round(latest.basic * 0.2);
  latest.da = Math.round(latest.basic * 0.1);
  const gross = latest.basic + latest.hra + latest.da + latest.bonus;
  latest.itDeduction = Math.round(gross * 0.1);
  latest.netSalary = gross - latest.itDeduction;
  latest.cycleId = `${employeeId}-C${Date.now()}`;
  latest.timestamp = new Date().toISOString();

  store.payrollByEmployee[employeeId].unshift(latest);

  createNotification({
    title: 'Salary Updated',
    message: `${employee.name}, your salary has been updated by ${increment}% by ${adminUser.name}.`,
    sourceSystem: 'Admin Console',
    severity: 'medium',
    roleTarget: `employee:${employee.id}`,
    relatedEntityId: employee.id,
    escalationLevel: 0
  });

  return { success: true, employee, payrollCycle: latest };
}

function getSystemAlerts() {
  return store.notifications.filter((n) => n.roleTarget === 'admin' && (n.severity === 'high' || n.escalationLevel > 0));
}

module.exports = {
  listEmployees,
  listRequests,
  modifyEmployeeSalary,
  getSystemAlerts
};
