// Credit Book — Users Service (admin + profile)
const bcrypt = require('bcrypt');
const prisma = require('../config/database');
const { NotFoundError, ForbiddenError, ValidationError } = require('../utils/errors');

// ─── Get current user profile ──────────────────────────────────────────────
async function getMe(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId, deletedAt: null },
  });
  if (!user) throw new NotFoundError('User');
  return formatUser(user);
}

// ─── Update profile ────────────────────────────────────────────────────────
async function updateMe(userId, { name, phone, email }) {
  const updates = {};
  if (name?.trim()) updates.name = name.trim();
  if (phone) {
    const normalizedPhone = phone.replace(/\s/g, '');
    const existing = await prisma.user.findFirst({
      where: { phone: normalizedPhone, id: { not: userId }, deletedAt: null },
    });
    if (existing) throw new ValidationError('Phone number already in use');
    updates.phone = normalizedPhone;
  }
  if (email) {
    const normalizedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      throw new ValidationError('Invalid email address');
    }
    const existing = await prisma.user.findFirst({
      where: { email: normalizedEmail, id: { not: userId }, deletedAt: null },
    });
    if (existing) throw new ValidationError('Email address already in use');
    updates.email = normalizedEmail;
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: updates,
  });

  return formatUser(user);
}

// ─── Change password ───────────────────────────────────────────────────────
async function changePassword(userId, { currentPassword, newPassword }) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new NotFoundError('User');

  const valid = await require('bcrypt').compare(currentPassword, user.passwordHash);
  if (!valid) throw new ValidationError('Current password is incorrect');

  if (newPassword.length < 6) throw new ValidationError('Password must be at least 6 characters');

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
}

// ─── Delete own account ────────────────────────────────────────────────────
async function deleteMe(userId) {
  await prisma.user.update({
    where: { id: userId },
    data: { deletedAt: new Date(), status: 'suspended' },
  });

  // Revoke all sessions
  await prisma.session.updateMany({
    where: { userId },
    data: { revokedAt: new Date() },
  });
}

// ─── ADMIN: Get all users ──────────────────────────────────────────────────
async function getAllUsers({ status, page = 1, limit = 50 } = {}) {
  const where = {
    deletedAt: null,
    ...(status ? { status } : {}),
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  return { users: users.map(formatUser), total };
}

// ─── ADMIN: Activate user ──────────────────────────────────────────────────
async function activateUser(userId, adminId) {
  const user = await prisma.user.findFirst({
    where: { id: userId, status: 'pending', deletedAt: null },
  });
  if (!user) throw new NotFoundError('User');

  await prisma.user.update({
    where: { id: userId },
    data: { status: 'active', activatedAt: new Date(), activatedBy: adminId },
  });

  // Create activation notification
  await prisma.notification.create({
    data: {
      userId,
      title: 'Welcome to Credit Book! 🎉',
      body: 'Your account has been activated. You can now use all features.',
      category: 'activation',
      deepLink: '/',
    },
  });
}

// ─── ADMIN: Reject user ────────────────────────────────────────────────────
async function rejectUser(userId, reason = '') {
  const user = await prisma.user.findFirst({
    where: { id: userId, status: 'pending', deletedAt: null },
  });
  if (!user) throw new NotFoundError('User');

  await prisma.user.update({
    where: { id: userId },
    data: { status: 'suspended' },
  });
}

// ─── ADMIN: Delete user ────────────────────────────────────────────────────
async function deleteUser(userId, adminId) {
  if (userId === adminId) throw new ForbiddenError('Cannot delete your own account');

  const user = await prisma.user.findFirst({
    where: { id: userId, deletedAt: null },
  });
  if (!user) throw new NotFoundError('User');

  await prisma.user.update({
    where: { id: userId },
    data: { deletedAt: new Date(), status: 'suspended' },
  });

  // Revoke all sessions
  await prisma.session.updateMany({
    where: { userId },
    data: { revokedAt: new Date() },
  });
}

// ─── Format user for API ───────────────────────────────────────────────────
function formatUser(u) {
  return {
    id: u.id,
    name: u.name,
    phone: u.phone,
    email: u.email || null,
    role: u.role,
    status: u.status,
    avatarColor: u.avatarColor,
    lastActiveAt: u.lastActiveAt,
    activatedAt: u.activatedAt,
    createdAt: u.createdAt,
  };
}

module.exports = {
  getMe,
  updateMe,
  changePassword,
  deleteMe,
  getAllUsers,
  activateUser,
  rejectUser,
  deleteUser,
};
