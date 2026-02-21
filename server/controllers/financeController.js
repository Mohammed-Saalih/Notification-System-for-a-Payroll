const financeService = require('../services/financeService');

function getAccounts(req, res) {
  return res.json(financeService.getAccounts());
}

function getLedger(req, res) {
  const ledger = financeService.getLedger(req.params.accountId);
  if (!ledger) return res.status(404).json({ message: 'GL account not found.' });
  return res.json(ledger);
}

function transfer(req, res) {
  const result = financeService.transferFunds({ ...req.body, user: req.user });
  if (!result.success) return res.status(400).json(result);
  return res.json(result);
}

module.exports = { getAccounts, getLedger, transfer };
