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
    },
  });

  // Calculate totals
  const totalGive = persons.reduce((sum, p) => p.balance < 0 ? sum + Math.abs(p.balance) : sum, 0);
  const totalGet = persons.reduce((sum, p) => p.balance > 0 ? sum + p.balance : sum, 0);

  return {
    persons: persons.map(formatPerson),
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

// ─── Get single person (verify ownership) ─────────────────────────────────
async function getPerson(personId, userId) {
  const person = await prisma.person.findFirst({
    where: { id: personId, ownerId: userId, deletedAt: null },
    include: {
      linkedUser: { select: { id: true, name: true } },
    },
  });

  if (!person) throw new NotFoundError('Person');
  return formatPerson(person);
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
    lastActivityAt: p.lastActivityAt,
    deleteScheduledAt: p.deleteScheduledAt,
    linkedUser: p.linkedUser || null,
    createdAt: p.createdAt,
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
};
