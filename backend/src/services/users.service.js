// Credit Book — Users Service (admin + profile)
const bcrypt = require('bcrypt');
const crypto = require('crypto');
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

  // Sign out all devices immediately after password change
  await prisma.session.updateMany({
    where: { userId },
    data: { revokedAt: new Date() },
  });
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

// ─── Request password reset (creates one-time token) ────────────────────────────
async function requestPasswordReset(phone) {
  const normalizedPhone = phone?.replace(/\s/g, '');
  if (!normalizedPhone) throw new ValidationError('Phone number is required');

  // Find user by phone (active users only)
  const user = await prisma.user.findFirst({
    where: { phone: normalizedPhone, deletedAt: null },
  });

  // Always create a request record (whether user found or not) to prevent phone enumeration.
  // If user not found, userId remains null — admin will see it but the link will be a no-op.
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  // Expire any existing pending requests for this phone
  await prisma.passwordResetRequest.updateMany({
    where: { phone: normalizedPhone, status: 'pending' },
    data: { status: 'expired' },
  });

  await prisma.passwordResetRequest.create({
    data: {
      phone: normalizedPhone,
      userId: user?.id ?? null,
      token,
      expiresAt,
    },
  });

  // Always return success — user is notified via WhatsApp by admin
  return { success: true };
}

// ─── Reset password using one-time token ───────────────────────────────────────
async function resetPassword(token, newPassword) {
  if (!token) throw new ValidationError('Reset token is required');
  if (!newPassword || newPassword.length < 6)
    throw new ValidationError('New password must be at least 6 characters');

  const request = await prisma.passwordResetRequest.findUnique({ where: { token } });
  if (!request) throw new ValidationError('Invalid or expired reset link');
  if (request.status === 'used') throw new ValidationError('This reset link has already been used');
  if (request.status === 'expired' || new Date() > request.expiresAt)
    throw new ValidationError('This reset link has expired. Please request a new one');
  if (!request.userId) throw new ValidationError('No account found for this reset link');

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id: request.userId }, data: { passwordHash } });

  // Mark token as used (one-time)
  await prisma.passwordResetRequest.update({
    where: { token },
    data: { status: 'used', usedAt: new Date() },
  });

  // Revoke all sessions for security
  await prisma.session.updateMany({
    where: { userId: request.userId },
    data: { revokedAt: new Date() },
  });

  return { success: true };
}

// ─── Admin: Get password reset requests ───────────────────────────────────────────
async function getPasswordResetRequests() {
  const requests = await prisma.passwordResetRequest.findMany({
    where: { status: { in: ['pending', 'sent'] } },
    orderBy: { createdAt: 'desc' },
  });

  const baseUrl = process.env.APP_URL || 'https://creditbook5.vercel.app';

  return requests.map((r) => {
    const resetLink = `${baseUrl}/reset-password?token=${r.token}`;

    // Normalize phone to WhatsApp international format (no + or spaces)
    // Handles: +91XXXXXXXXXX → 91XXXXXXXXXX, 0XXXXXXXXXX → 91XXXXXXXXXX, XXXXXXXXXX → 91XXXXXXXXXX
    let rawPhone = (r.phone || '').replace(/[\s\-()]/g, '');
    if (rawPhone.startsWith('+')) rawPhone = rawPhone.slice(1);
    // If 10-digit number (no country code), prepend 91
    if (/^\d{10}$/.test(rawPhone)) rawPhone = '91' + rawPhone;
    // If starts with 0 (Indian trunk prefix), replace with 91
    if (rawPhone.startsWith('0') && rawPhone.length === 11) rawPhone = '91' + rawPhone.slice(1);

    const greeting = `Hi! Here is your Credit Book password reset link.\n\nClick the link below to reset your password. This link can only be used *once* and expires in 24 hours:\n\n${resetLink}\n\nIf you did not request this, please ignore this message.`;
    const waLink = `https://wa.me/${rawPhone}?text=${encodeURIComponent(greeting)}`;

    return {
      id: r.id,
      phone: r.phone,
      userId: r.userId,
      status: r.status,
      createdAt: r.createdAt,
      expiresAt: r.expiresAt,
      sentAt: r.sentAt,
      resetLink,
      waLink,
    };
  });
}

// ─── Admin: Mark reset request as sent ─────────────────────────────────────────
async function markResetSent(requestId) {
  await prisma.passwordResetRequest.update({
    where: { id: requestId },
    data: { status: 'sent', sentAt: new Date() },
  });
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
  requestPasswordReset,
  resetPassword,
  getPasswordResetRequests,
  markResetSent,
};
