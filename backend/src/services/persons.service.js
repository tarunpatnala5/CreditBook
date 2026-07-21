// Credit Book — Persons Service
const prisma = require('../config/database');
const { NotFoundError, ForbiddenError, ConflictError } = require('../utils/errors');

// Deterministic avatar color from name
function getAvatarColor(name) {
  const colors = ['#FF3B30', '#FF9500', '#FFCC00', '#34C759', '#5AC8FA', '#007AFF', '#5856D6', '#AF52DE', '#FF2D55'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

// ─── Get all persons owned by a user ──────────────────────────────────────
async function getPersons(userId, { search, sort } = {}) {
  const where = {
    ownerId: userId,
    deletedAt: null,
  };

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { phone: { contains: search } },
    ];
  }

  const persons = await prisma.person.findMany({
    where,
    orderBy: sort === 'name' ? { name: 'asc' } : { lastActivityAt: 'desc' },
    include: {
      linkedUser: { select: { id: true, name: true, phone: true } },
      _count: { select: { transactions: { where: { deletedAt: null } } } },
      // Include interest transactions to compute live totals
      transactions: {
        where: { deletedAt: null, status: 'interest' },
        select: { amount: true, type: true, interestRate: true, interestFrequency: true, transactionDate: true },
      },
    },
  });

  // Compute interestTabTotal per person (signed NET: gave=positive, got=negative)
  const { computeLiveAmount } = require('./transactions.service');
  const personsWithInterest = persons.map((p) => {
    let interestTabTotal = 0;
    for (const t of p.transactions) {
      if (t.interestRate) {
        const live = computeLiveAmount(t.amount, t.interestRate, t.interestFrequency || 'annually', t.transactionDate);
        // got = user received (positive: user owes them) | gave = user lent (negative: they owe user)
        interestTabTotal += t.type === 'got' ? live : -live;
      }
    }
    return { ...p, interestTabTotal };
  });

  // True net per person = balance + signedInterest (both signed: negative=gave, positive=got)
  // totalGive = sum of nets where person owes user (net < 0 means user gave more)
  // totalGet  = sum of nets where user owes person  (net > 0 means user got more)
  const totalGive = personsWithInterest.reduce((sum, p) => {
    const net = p.balance + p.interestTabTotal;
    return sum + (net < 0 ? Math.abs(net) : 0);
  }, 0);
  const totalGet = personsWithInterest.reduce((sum, p) => {
    const net = p.balance + p.interestTabTotal;
    return sum + (net > 0 ? net : 0);
  }, 0);

  return {
    persons: personsWithInterest.map(formatPerson),
    totalGive,
    totalGet,
    total: persons.length,
  };
}

// ─── Get shared persons (persons that others created with this user's phone) ─
async function getSharedPersons(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.phone) return { persons: [], totalGive: 0, totalGet: 0 };

  const persons = await prisma.person.findMany({
    where: {
      linkedUserId: userId,
      deletedAt: null,
      ownerId: { not: userId }, // exclude own entries
    },
    include: {
      owner: { select: { id: true, name: true, avatarColor: true } },
    },
    orderBy: { lastActivityAt: 'desc' },
  });

  return {
    persons: persons.map((p) => ({
      ...formatPerson(p),
      owner: p.owner,
    })),
    total: persons.length,
  };
}

// ─── Get single person (owner OR shared/linked user — view-only for the latter) ─
async function getPerson(personId, userId) {
  const person = await prisma.person.findFirst({
    where: {
      id: personId,
      deletedAt: null,
      OR: [{ ownerId: userId }, { linkedUserId: userId }],
    },
    include: {
      linkedUser: { select: { id: true, name: true } },
      owner: { select: { id: true, name: true, avatarColor: true } },
      transactions: {
        where: { deletedAt: null, status: 'interest' },
        select: { amount: true, type: true, interestRate: true, interestFrequency: true, transactionDate: true },
      },
    },
  });

  if (!person) throw new NotFoundError('Person');

  // Compute interestTabTotal — signed NET of all interest transactions (gave=positive, got=negative)
  const { computeLiveAmount } = require('./transactions.service');
  let interestTabTotal = 0;
  for (const t of person.transactions) {
    if (t.interestRate) {
      const live = computeLiveAmount(t.amount, t.interestRate, t.interestFrequency || 'annually', t.transactionDate);
      // got = user received (positive: user owes them) | gave = user lent (negative: they owe user)
      interestTabTotal += t.type === 'got' ? live : -live;
    }
  }

  return {
    ...formatPerson(person),
    interestTabTotal,
    isOwner: person.ownerId === userId,
    owner: person.ownerId === userId ? null : person.owner,
  };
}


// ─── Create person ─────────────────────────────────────────────────────────
async function createPerson(userId, { name, phone }) {
  if (!name?.trim()) {
    const { ValidationError } = require('../utils/errors');
    throw new ValidationError('Name is required');
  }

  const normalizedPhone = phone?.replace(/\s/g, '') || null;

  // Find linked user if phone provided
  let linkedUserId = null;
  if (normalizedPhone) {
    const linkedUser = await prisma.user.findFirst({
      where: { phone: normalizedPhone, status: 'active', deletedAt: null },
    });
    if (linkedUser) linkedUserId = linkedUser.id;
  }

  const person = await prisma.person.create({
    data: {
      ownerId: userId,
      linkedUserId,
      name: name.trim(),
      phone: normalizedPhone,
      avatarColor: getAvatarColor(name.trim()),
      balance: 0,
    },
  });

  return formatPerson(person);
}

// ─── Update person ─────────────────────────────────────────────────────────
async function updatePerson(personId, userId, { name, phone }) {
  const person = await prisma.person.findFirst({
    where: { id: personId, ownerId: userId, deletedAt: null },
  });
  if (!person) throw new NotFoundError('Person');

  const normalizedPhone = phone?.replace(/\s/g, '') || person.phone;

  // Re-link if phone changed
  let linkedUserId = person.linkedUserId;
  if (phone !== undefined) {
    const linkedUser = await prisma.user.findFirst({
      where: { phone: normalizedPhone, status: 'active', deletedAt: null },
    });
    linkedUserId = linkedUser ? linkedUser.id : null;
  }

  const updated = await prisma.person.update({
    where: { id: personId },
    data: {
      name: name?.trim() || person.name,
      phone: normalizedPhone,
      linkedUserId,
      avatarColor: name ? getAvatarColor(name.trim()) : person.avatarColor,
    },
  });

  return formatPerson(updated);
}

// ─── Schedule person delete (24 hours) ────────────────────────────────────
async function scheduleDeletion(personId, userId) {
  const person = await prisma.person.findFirst({
    where: { id: personId, ownerId: userId, deletedAt: null },
  });
  if (!person) throw new NotFoundError('Person');

  const deleteAt = new Date();
  deleteAt.setHours(deleteAt.getHours() + 24);

  await prisma.person.update({
    where: { id: personId },
    data: { deleteScheduledAt: deleteAt },
  });

  return { deleteScheduledAt: deleteAt };
}

// ─── Restore (undo) scheduled deletion ────────────────────────────────────
async function restorePerson(personId, userId) {
  const person = await prisma.person.findFirst({
    where: { id: personId, ownerId: userId, deletedAt: null },
  });
  if (!person) throw new NotFoundError('Person');

  await prisma.person.update({
    where: { id: personId },
    data: { deleteScheduledAt: null },
  });
}

// ─── Recalculate balance ──────────────────────────────────────────────────
// Note: interest-status transactions are excluded — they are for display only
async function recalculateBalance(personId) {
  const transactions = await prisma.transaction.findMany({
    where: { personId, deletedAt: null, status: 'current' },
  });

  let balance = 0;
  for (const t of transactions) {
    if (t.type === 'got') balance += t.currentAmount;
    else balance -= t.currentAmount;
  }

  await prisma.person.update({
    where: { id: personId },
    data: { balance, lastActivityAt: new Date() },
  });

  return balance;
}

// ─── Format person for API response ───────────────────────────────────────
function formatPerson(p) {
  return {
    id: p.id,
    name: p.name,
    phone: p.phone,
    avatarColor: p.avatarColor,
    balance: p.balance,
    interestTabTotal: p.interestTabTotal ?? 0,
    lastActivityAt: p.lastActivityAt,
    deleteScheduledAt: p.deleteScheduledAt,
    linkedUser: p.linkedUser || null,
    createdAt: p.createdAt,
  };
}

// ─── Generate / return share token for a person ───────────────────────────
async function generateShareToken(personId, ownerId) {
  const person = await prisma.person.findFirst({
    where: { id: personId, ownerId, deletedAt: null },
  });
  if (!person) throw new NotFoundError('Person');

  // Re-use existing token or generate new one
  if (person.shareToken) return person.shareToken;

  const { v4: uuidv4 } = require('uuid');
  const token = uuidv4().replace(/-/g, ''); // 32-char hex token
  await prisma.person.update({ where: { id: personId }, data: { shareToken: token } });
  return token;
}

// ─── Revoke share token ────────────────────────────────────────────────────
async function revokeShareToken(personId, ownerId) {
  const person = await prisma.person.findFirst({
    where: { id: personId, ownerId, deletedAt: null },
  });
  if (!person) throw new NotFoundError('Person');
  await prisma.person.update({ where: { id: personId }, data: { shareToken: null } });
}

// ─── Get public share data (no auth) ──────────────────────────────────────
async function getPublicShare(token) {
  const person = await prisma.person.findFirst({
    where: { shareToken: token, deletedAt: null },
    include: { owner: { select: { name: true } } },
  });
  if (!person) throw new NotFoundError('Share link');

  const transactions = await prisma.transaction.findMany({
    where: { personId: person.id, deletedAt: null },
    orderBy: { transactionDate: 'desc' },
  });

  return {
    person: {
      id: person.id,
      name: person.name,
      avatarColor: person.avatarColor,
      balance: person.balance,
      ownerName: person.owner?.name,
    },
    transactions: transactions.map((t) => ({
      id: t.id,
      type: t.type,
      amount: t.amount,
      currentAmount: t.currentAmount,
      description: t.description,
      interestRate: t.interestRate,
      status: t.status,
      balanceAfter: t.balanceAfter,
      transactionDate: t.transactionDate,
    })),
  };
}

module.exports = {
  getPersons,
  getSharedPersons,
  getPerson,
  createPerson,
  updatePerson,
  scheduleDeletion,
  restorePerson,
  recalculateBalance,
  generateShareToken,
  revokeShareToken,
  getPublicShare,
};
