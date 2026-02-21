const { store } = require('../data/store');
const { generateId } = require('../utils/id');
const { createNotification } = require('./notificationService');

function getPayrollHistory(employeeId) {
  return store.payrollByEmployee[employeeId] || [];
}

function getSalaryBreakdown(employeeId) {
  const cycles = getPayrollHistory(employeeId);
  return cycles[0] || null;
}

function submitRevisionRequest(employee, payload) {
  const request = {
    id: generateId('req'),
    employeeId: employee.id,
    title: payload.title || 'Salary Revision Request',
    message: payload.message || 'Requesting salary revision',
    proposedIncrementPct: Number(payload.proposedIncrementPct || 0),
    timestamp: new Date().toISOString(),
    status: 'pending'
  };

  store.salaryRequests.unshift(request);

  createNotification({
    title: `Revision Request from ${employee.name}`,
    message: request.message,
    sourceSystem: 'Employee Portal',
    severity: 'medium',
    roleTarget: 'admin',
    relatedEntityId: request.id,
    escalationLevel: 1
  });

  return request;
}

module.exports = {
  getPayrollHistory,
  getSalaryBreakdown,
  submitRevisionRequest
};
