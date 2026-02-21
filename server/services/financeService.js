const { store, createLedgerEntry } = require('../data/store');
const { generateId } = require('../utils/id');
const { createNotification } = require('./notificationService');

function getAccounts() {
  return store.glAccounts;
}

function getLedger(accountId) {
  const account = store.glAccounts.find((a) => a.id === accountId);
  return account ? account.ledger : null;
}

function transferFunds({ fromAccountId, toAccountId, amount, confirmToken, user }) {
  const numericAmount = Number(amount);
  if (Number.isNaN(numericAmount) || numericAmount <= 0) {
    return { success: false, message: 'Invalid transfer amount.' };
  }

  const from = store.glAccounts.find((a) => a.id === fromAccountId);
  const to = store.glAccounts.find((a) => a.id === toAccountId);
  if (!from || !to || from.id === to.id) {
    return { success: false, message: 'Invalid source/destination account.' };
  }

  if (!confirmToken) {
    const token = generateId('confirm');
    store.pendingTransfers[token] = { fromAccountId, toAccountId, amount: numericAmount, requestedBy: user.id };
    return {
      success: true,
      requiresConfirmation: true,
      confirmationToken: token,
      message: 'Confirm transfer to execute.'
    };
  }

  const pending = store.pendingTransfers[confirmToken];
  if (!pending || pending.requestedBy !== user.id) {
    return { success: false, message: 'Invalid confirmation token.' };
  }

  if (from.balance < pending.amount) {
    delete store.pendingTransfers[confirmToken];
    return { success: false, message: 'Insufficient balance.' };
  }

  from.balance -= pending.amount;
  to.balance += pending.amount;

  const referenceId = generateId('txn');
  from.ledger.unshift(createLedgerEntry('transfer', pending.amount, referenceId));
  to.ledger.unshift(createLedgerEntry('transfer', pending.amount, referenceId));

  delete store.pendingTransfers[confirmToken];

  createNotification({
    title: 'GL Transfer Completed',
    message: `${user.name} transferred ${pending.amount} from ${from.name} to ${to.name}.`,
    sourceSystem: 'Finance Console',
    severity: 'low',
    roleTarget: 'finance',
    relatedEntityId: referenceId,
    escalationLevel: 0
  });

  return { success: true, referenceId, from, to };
}

module.exports = { getAccounts, getLedger, transferFunds };
