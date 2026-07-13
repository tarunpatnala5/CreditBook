// Credit Book — Transactions Service
const prisma = require('../config/database');
const { NotFoundError, ForbiddenError, ValidationError } = require('../utils/errors');
const personsService = require('./persons.service');

// ─── Get transactions for a person ────────────────────────────────────────
async function getTransactions(personId, userId, { status, type, page = 1, limit = 50 } = {}) {
  // Verify person belongs to user OR is shared with user
  const person = await prisma.person.findFirst({
    where: {
      id: personId,
      deletedAt: null,
      OR: [{ ownerId: userId }, { linkedUserId: userId }],
    },
  });

  if (!person) throw new NotFoundError('Person');

  const where = {
    personId,
    deletedAt: null,
    ...(status && status !== 'all' ? { status } : {}),
    ...(type ? { type } : {}),
  };

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      orderBy: { transactionDate: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.transaction.count({ where }),
  ]);

  return {
    transactions: transactions.map(formatTransaction),
    total,
    currentBalance: person.balance,
  };
}

// ─── Create transaction ────────────────────────────────────────────────────
async function createTransaction(personId, userId, data) {
  const { type, amount, description, transactionDate, interestRate, interestType } = data;

  if (!type || !['gave', 'got'].includes(type)) {
    throw new ValidationError('Type must be "gave" or "got"');
  }

  if (!amount || amount <= 0) {
    throw new ValidationError('Amount must be greater than 0');
  }

  // Verify person ownership
  const person = await prisma.person.findFirst({
    where: { id: personId, ownerId: userId, deletedAt: null },
  });

  if (!person) throw new NotFoundError('Person');

  // Determine if upcoming (future date)
  const txnDate = transactionDate ? new Date(transactionDate) : new Date();
  const now = new Date();
  const status = txnDate > now ? 'upcoming' : 'current';

  // Calculate balance after
  let currentBalance = person.balance;
  let balanceAfter = currentBalance;
  
  if (status === 'current') {
    balanceAfter = type === 'got' 
      ? currentBalance + parseFloat(amount) 
      : currentBalance - parseFloat(amount);
  }

  const transaction = await prisma.transaction.create({
    data: {
      personId,
      ownerId: userId,
      type,
      amount: parseFloat(amount),
      currentAmount: parseFloat(amount),
      description: description?.trim() || null,
      interestRate: interestRate ? parseFloat(interestRate) : null,
      interestType: interestType || 'simple',
      transactionDate: txnDate,
      status,
      balanceAfter,
    },
  });

  // Update person balance (only for current transactions)
  if (status === 'current') {
    await personsService.recalculateBalance(personId);
  }

  return formatTransaction(transaction);
}

// ─── Update transaction ────────────────────────────────────────────────────
async function updateTransaction(personId, transactionId, userId, data) {
  const transaction = await prisma.transaction.findFirst({
    where: { id: transactionId, personId, ownerId: userId, deletedAt: null },
  });

  if (!transaction) throw new NotFoundError('Transaction');

  const updates = {};
  if (data.type) updates.type = data.type;
  if (data.amount !== undefined) {
    updates.amount = parseFloat(data.amount);
    updates.currentAmount = parseFloat(data.amount);
  }
  if (data.description !== undefined) updates.description = data.description?.trim() || null;
  if (data.transactionDate) {
    const txnDate = new Date(data.transactionDate);
    updates.transactionDate = txnDate;
    updates.status = txnDate > new Date() ? 'upcoming' : 'current';
  }
  if (data.interestRate !== undefined) updates.interestRate = data.interestRate ? parseFloat(data.interestRate) : null;

  const updated = await prisma.transaction.update({
    where: { id: transactionId },
    data: updates,
  });

  // Recalculate balance
  await personsService.recalculateBalance(personId);

  return formatTransaction(updated);
}

// ─── Soft delete transaction ───────────────────────────────────────────────
async function deleteTransaction(personId, transactionId, userId) {
  const transaction = await prisma.transaction.findFirst({
    where: { id: transactionId, personId, ownerId: userId, deletedAt: null },
  });

  if (!transaction) throw new NotFoundError('Transaction');

  await prisma.transaction.update({
    where: { id: transactionId },
    data: { deletedAt: new Date() },
  });

  // Recalculate balance
  await personsService.recalculateBalance(personId);
}

// ─── Get interest history for a transaction ────────────────────────────────
async function getInterestHistory(transactionId) {
  return prisma.interestHistory.findMany({
    where: { transactionId },
    orderBy: { date: 'desc' },
    take: 90, // Last 90 days
  });
}

// ─── Format transaction for API ────────────────────────────────────────────
function formatTransaction(t) {
  return {
    id: t.id,
    type: t.type,
    amount: t.amount,
    currentAmount: t.currentAmount,
    description: t.description,
    interestRate: t.interestRate,
    interestType: t.interestType,
    balanceAfter: t.balanceAfter,
    transactionDate: t.transactionDate,
    status: t.status,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
  };
}

module.exports = {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getInterestHistory,
};
