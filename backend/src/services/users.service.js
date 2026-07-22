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
  const normalizedPhone = (phone || '').replace(/[\s\-()]/g, '').trim();
  if (!normalizedPhone) throw new ValidationError('Phone number is required');

  // Find user by phone — try multiple formats
  // stored as: 9876543210, +919876543210, 919876543210
  let user = await prisma.user.findFirst({ where: { phone: normalizedPhone, deletedAt: null } });
  if (!user) {
    // Try with +91 prefix
    const withPlus = normalizedPhone.startsWith('+') ? normalizedPhone : `+${normalizedPhone}`;
    user = await prisma.user.findFirst({ where: { phone: withPlus, deletedAt: null } });
  }
  if (!user && normalizedPhone.startsWith('91') && normalizedPhone.length === 12) {
    // Try stripping 91 prefix
    user = await prisma.user.findFirst({ where: { phone: normalizedPhone.slice(2), deletedAt: null } });
  }
  if (!user && normalizedPhone.length === 10) {
    // Try with 91 prefix
    user = await prisma.user.findFirst({ where: { phone: `91${normalizedPhone}`, deletedAt: null } });
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours

  try {
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
  } catch (dbErr) {
    // Log for server-side visibility but don't crash the endpoint
    console.error('[requestPasswordReset] DB error:', dbErr?.message || dbErr);
    // Still return success — user doesn't need to know about internal errors
  }

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
  try {
    const requests = await prisma.passwordResetRequest.findMany({
      where: { status: { in: ['pending', 'sent'] } },
      orderBy: { createdAt: 'desc' },
    });

    // Batch-fetch user names for all requests that have a userId
    const userIds = [...new Set(requests.map(r => r.userId).filter(Boolean))];
    const users = userIds.length
      ? await prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true, name: true, phone: true } })
      : [];
    const userMap = Object.fromEntries(users.map(u => [u.id, u]));

    const baseUrl = process.env.APP_URL || 'https://creditbook5.vercel.app';

    return requests.map((r) => {
      const resetLink = `${baseUrl}/reset-password?token=${r.token}`;
      const linkedUser = r.userId ? userMap[r.userId] : null;

      let rawPhone = (r.phone || '').replace(/[\s\-()]/g, '');
      if (rawPhone.startsWith('+')) rawPhone = rawPhone.slice(1);
      if (/^\d{10}$/.test(rawPhone)) rawPhone = '91' + rawPhone;
      if (rawPhone.startsWith('0') && rawPhone.length === 11) rawPhone = '91' + rawPhone.slice(1);

      const greeting = `Hi! Here is your Credit Book password reset link.\n\nClick the link below to reset your password. This link can only be used *once* and expires in 48 hours:\n\n${resetLink}\n\nIf you did not request this, please ignore this message.`;
      const waLink = `https://wa.me/${rawPhone}?text=${encodeURIComponent(greeting)}`;

      return {
        id: r.id,
        phone: r.phone,
        userName: linkedUser?.name || null,
        userId: r.userId,
        status: r.status,
        createdAt: r.createdAt,
        expiresAt: r.expiresAt,
        sentAt: r.sentAt,
        resetLink,
        waLink,
      };
    });
  } catch (err) {
    console.error('[getPasswordResetRequests] DB error (table may not exist yet):', err?.message);
    return [];
  }
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
