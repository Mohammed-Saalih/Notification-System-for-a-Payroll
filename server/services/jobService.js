const { store, randomInt, createPayrollCycle } = require('../data/store');
const { createNotification, shouldThrottle } = require('./notificationService');
const { logEvent } = require('../utils/logger');

const JOB_CONFIG = [
  { key: 'attendancePayroll', name: 'Attendance → Payroll Integration', intervalMs: 12000, roleTarget: 'admin' },
  { key: 'payrollExecution', name: 'Payroll Execution', intervalMs: 15000, roleTarget: 'admin' },
  { key: 'taxValidation', name: 'Tax Validation', intervalMs: 18000, roleTarget: 'finance' },
  { key: 'glThreshold', name: 'GL Threshold Monitoring', intervalMs: 10000, roleTarget: 'finance' },
  { key: 'bankInterface', name: 'Bank Interface', intervalMs: 20000, roleTarget: 'admin' }
];

function initializeJobState() {
  JOB_CONFIG.forEach((job) => {
    store.jobStates[job.key] = {
      failureCount: 0,
      retryCount: 0,
      escalationLevel: 0,
      circuitState: 'closed',
      openUntil: null,
      lastRunAt: null
    };
  });
}

function handleSuccess(job) {
  const state = store.jobStates[job.key];
  state.retryCount = 0;
  state.failureCount = 0;
  state.escalationLevel = 0;
  state.circuitState = 'closed';
  state.openUntil = null;

  if (job.key === 'payrollExecution') {
    const employees = store.users.filter((u) => u.role === 'employee');
    const randomEmployee = employees[randomInt(0, employees.length - 1)];
    const cycles = store.payrollByEmployee[randomEmployee.id] || [];
    const cycle = createPayrollCycle(randomEmployee.id, cycles.length + 1);
    cycles.unshift(cycle);
    store.payrollByEmployee[randomEmployee.id] = cycles;
  }

  if (job.key === 'glThreshold') {
    store.glAccounts.forEach((acc) => {
      if (acc.balance < acc.threshold) {
        const throttleKey = `gl-threshold-${acc.id}`;
        if (!shouldThrottle(throttleKey, 20000)) {
          createNotification({
            title: 'GL Threshold Alert',
            message: `${acc.name} dropped below threshold. Balance: ${acc.balance}.`,
            sourceSystem: job.name,
            severity: 'high',
            roleTarget: 'finance',
            relatedEntityId: acc.id,
            escalationLevel: 1
          });
        }
      }
    });
  }

  logEvent('JOB_SUCCESS', { job: job.name });
}

function handleFailure(job, reason = 'Randomized fault') {
  const state = store.jobStates[job.key];
  state.failureCount += 1;
  state.retryCount += 1;
  state.escalationLevel = Math.min(3, state.failureCount);

  if (state.retryCount >= 3) {
    state.circuitState = 'open';
    state.openUntil = Date.now() + 25000;
    state.retryCount = 0;
  }

  const severity = state.escalationLevel >= 2 ? 'high' : 'medium';
  const throttleKey = `job-fail-${job.key}-${severity}`;
  if (!shouldThrottle(throttleKey, 12000)) {
    createNotification({
      title: `${job.name} Failure`,
      message: `${job.name} failed (${reason}). Retry policy active. Circuit: ${state.circuitState}.`,
      sourceSystem: 'Background Job Engine',
      severity,
      roleTarget: job.roleTarget,
      relatedEntityId: job.key,
      escalationLevel: state.escalationLevel
    });
  }

  logEvent('JOB_FAILURE', {
    job: job.name,
    reason,
    retryCount: state.retryCount,
    failureCount: state.failureCount,
    escalationLevel: state.escalationLevel,
    circuitState: state.circuitState
  });
}

function executeJob(job) {
  const state = store.jobStates[job.key];
  state.lastRunAt = new Date().toISOString();

  // Circuit breaker simulation for fault tolerance and controlled recovery.
  if (state.circuitState === 'open') {
    if (Date.now() < state.openUntil) {
      logEvent('JOB_SKIPPED_CIRCUIT_OPEN', { job: job.name, until: state.openUntil });
      return;
    }
    state.circuitState = 'closed';
    state.failureCount = 0;
  }

  const fail = Math.random() < 0.35;
  if (fail) {
    handleFailure(job);
    return;
  }
  handleSuccess(job);
}

function startJobs() {
  initializeJobState();
  JOB_CONFIG.forEach((job) => {
    setInterval(() => executeJob(job), job.intervalMs);
  });
}

module.exports = { startJobs };
