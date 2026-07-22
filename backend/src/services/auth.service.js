// Credit Book — Auth Service
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const prisma = require('../config/database');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const {
  UnauthorizedError,
  ConflictError,
  ValidationError,
  ForbiddenError,
} = require('../utils/errors');

const SALT_ROUNDS = 12;

// ─── Helper: parse device info from user-agent ─────────────────────────────
function parseDeviceInfo(userAgent = '', ip = '') {
  const ua = userAgent.toLowerCase();

  let deviceType = 'web';
  let browser = 'Unknown';
  let os = 'Unknown';
  let deviceName = 'Web Browser';

  // OS detection
  if (ua.includes('android')) { os = 'Android'; deviceType = 'android'; }
  else if (ua.includes('iphone') || ua.includes('ipad')) { os = 'iOS'; deviceType = 'ios'; }
  else if (ua.includes('windows')) os = 'Windows';
  else if (ua.includes('mac')) os = 'macOS';
  else if (ua.includes('linux')) os = 'Linux';

  // Browser detection
  if (ua.includes('chrome') && !ua.includes('edg')) browser = 'Chrome';
  else if (ua.includes('firefox')) browser = 'Firefox';
  else if (ua.includes('safari') && !ua.includes('chrome')) browser = 'Safari';
  else if (ua.includes('edg')) browser = 'Edge';
  else if (ua.includes('opera')) browser = 'Opera';

  // Device name
  if (deviceType === 'web') deviceName = `${browser} on ${os}`;
  else if (deviceType === 'android') deviceName = `Android Device`;
  else if (deviceType === 'ios') deviceName = `iPhone/iPad`;

  return { deviceType, browser, os, deviceName };
}

// ─── Register ─────────────────────────────────────────────────────────
async function register({ name, phone, password, confirmPassword }) {
  if (!name || !phone || !password) {
    throw new ValidationError('Name, phone, and password are required');
  }

  if (password !== confirmPassword) {
    throw new ValidationError('Passwords do not match');
  }

  if (password.length < 6) {
    throw new ValidationError('Password must be at least 6 characters');
  }

  // Normalize
  const normalizedPhone = phone.replace(/\s/g, '');

  // Check duplicates (exclude soft-deleted users)
  const existingPhone = await prisma.user.findFirst({ where: { phone: normalizedPhone, deletedAt: null } });
  if (existingPhone) throw new ConflictError('Phone number already registered');

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  // Determine avatar color from name hash
  const colors = ['#FF3B30', '#FF9500', '#FFCC00', '#34C759', '#5AC8FA', '#007AFF', '#5856D6', '#AF52DE', '#FF2D55'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const avatarColor = colors[Math.abs(hash) % colors.length];

  const user = await prisma.user.create({
    data: {
      name: name.trim(),
      phone: normalizedPhone,
      passwordHash,
      role: 'user',
      status: 'pending',
      avatarColor,
    },
  });

  return {
    id: user.id,
    name: user.name,
    phone: user.phone,
    status: user.status,
    createdAt: user.createdAt,
  };
}

// ─── Login ─────────────────────────────────────────────────────────
async function login({ phone, password, userAgent, ipAddress }) {
  const normalizedPhone = (phone?.trim() || '').replace(/\s/g, '');
  const user = await prisma.user.findFirst({
    where: { phone: normalizedPhone, deletedAt: null },
  });

  if (!user) {
    throw new UnauthorizedError('Invalid credentials');
  }

  if (user.status === 'pending') {
    throw new ForbiddenError('Account pending activation. Contact admin.');
  }

  if (user.status === 'suspended') {
    throw new ForbiddenError('Account has been suspended. Contact admin.');
  }

  const passwordValid = await bcrypt.compare(password, user.passwordHash);
  if (!passwordValid) {
    throw new UnauthorizedError('Invalid credentials');
  }

  // Create session (unlimited — 365 days, stays until logout/remove device)
  const { deviceType, browser, os, deviceName } = parseDeviceInfo(userAgent, ipAddress);
  const expiresAt = new Date();
  expiresAt.setFullYear(expiresAt.getFullYear() + 1); // 1 year

  const sessionId = uuidv4();
  const refreshPayload = { sub: user.id, sessionId };

  const accessToken = signAccessToken({ sub: user.id, role: user.role, sessionId });
  const refreshToken = signRefreshToken(refreshPayload);

  await prisma.session.create({
    data: {
      id: sessionId,
      userId: user.id,
      refreshToken,
      deviceType,
      deviceName,
      browser,
      os,
      ipAddress: ipAddress || null,
      userAgent: userAgent || null,
      lastActiveAt: new Date(),
      expiresAt,
    },
  });

  // Update last active
  await prisma.user.update({
    where: { id: user.id },
    data: { lastActiveAt: new Date() },
  });

  return {
    accessToken,
    refreshToken,
    expiresIn: 7 * 24 * 3600, // 7 days in seconds
    user: {
      id: user.id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      role: user.role,
      status: user.status,
      avatarColor: user.avatarColor,
    },
  };
}

// ─── Refresh Token ─────────────────────────────────────────────────────────
async function refreshTokens(oldRefreshToken) {
  let payload;
  try {
    payload = verifyRefreshToken(oldRefreshToken);
  } catch {
    throw new UnauthorizedError('Invalid refresh token');
  }

  // Find session
  const session = await prisma.session.findUnique({
    where: { refreshToken: oldRefreshToken },
    include: { user: true },
  });

  if (!session || session.revokedAt || new Date() > session.expiresAt) {
    throw new UnauthorizedError('Session expired or revoked. Please sign in again.');
  }

  const user = session.user;

  if (!user || user.deletedAt || user.status !== 'active') {
    throw new UnauthorizedError('User account is not active');
  }

  // Issue new access token only (refresh token stays the same for unlimited session)
  const newAccessToken = signAccessToken({ sub: user.id, role: user.role, sessionId: session.id });

  // Update session last active
  await prisma.session.update({
    where: { id: session.id },
    data: { lastActiveAt: new Date() },
  });

  return {
    accessToken: newAccessToken,
    refreshToken: oldRefreshToken, // same refresh token (unlimited session)
    expiresIn: 7 * 24 * 3600,
  };
}

// ─── Logout (single session) ───────────────────────────────────────────────
async function logout(userId, refreshToken) {
  if (refreshToken) {
    await prisma.session.updateMany({
      where: { userId, refreshToken },
      data: { revokedAt: new Date() },
    });
  }
}

// ─── Logout All Devices ────────────────────────────────────────────────────
async function logoutAll(userId) {
  await prisma.session.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

// ─── Get all sessions (devices) for a user ────────────────────────────────
async function getSessions(userId, currentSessionId) {
  const sessions = await prisma.session.findMany({
    where: { userId, revokedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { lastActiveAt: 'desc' },
  });

  return sessions.map((s) => ({
    id: s.id,
    deviceName: s.deviceName,
    deviceType: s.deviceType,
    browser: s.browser,
    os: s.os,
    ipAddress: s.ipAddress,
    lastActiveAt: s.lastActiveAt,
    createdAt: s.createdAt,
    isCurrent: s.id === currentSessionId,
  }));
}

// ─── Remove specific session (device) ─────────────────────────────────────
async function revokeSession(userId, sessionId) {
  const session = await prisma.session.findFirst({
    where: { id: sessionId, userId },
  });

  if (!session) {
    throw new ForbiddenError('Session not found');
  }

  await prisma.session.update({
    where: { id: sessionId },
    data: { revokedAt: new Date() },
  });
}

module.exports = {
  register,
  login,
  refreshTokens,
  logout,
  logoutAll,
  getSessions,
  revokeSession,
};
