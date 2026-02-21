const employeeService = require('../services/employeeService');

function getPayrollHistory(req, res) {
  const history = employeeService.getPayrollHistory(req.user.id);
  return res.json(history);
}

function getSalaryDetails(req, res) {
  const details = employeeService.getSalaryBreakdown(req.user.id);
  return res.json(details || {});
}

function submitRevisionRequest(req, res) {
  const request = employeeService.submitRevisionRequest(req.user, req.body || {});
  return res.status(201).json(request);
}

module.exports = {
  getPayrollHistory,
  getSalaryDetails,
  submitRevisionRequest
};
