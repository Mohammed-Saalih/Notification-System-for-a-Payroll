const adminService = require('../services/adminService');

function listEmployees(req, res) {
  return res.json(adminService.listEmployees());
}

function listRequests(req, res) {
  return res.json(adminService.listRequests());
}

function modifySalary(req, res) {
  const { employeeId, percentage } = req.body;
  const result = adminService.modifyEmployeeSalary({ employeeId, percentage, adminUser: req.user });
  if (!result.success) {
    return res.status(400).json(result);
  }
  return res.json(result);
}

function systemAlerts(req, res) {
  return res.json(adminService.getSystemAlerts());
}

module.exports = { listEmployees, listRequests, modifySalary, systemAlerts };
