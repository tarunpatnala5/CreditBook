// Credit Book — Middleware: Auth (JWT Verification)
const { verifyAccessToken } = require('../utils/jwt');
const { UnauthorizedError } = require('../utils/errors');
const prisma = require('../config/database');

async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyAccessToken(token);

    // Fetch user from DB to ensure they still exist and are active
    const user = await prisma.user.findUnique({
      where: { id: payload.sub, deletedAt: null },
    });

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    if (user.status === 'pending') {
      throw new UnauthorizedError('Account pending activation');
    }

    if (user.status === 'suspended') {
      throw new UnauthorizedError('Account suspended');
    }

    // Attach user to request
    req.user = user;

    // Update last active (non-blocking)
    prisma.user
      .update({ where: { id: user.id }, data: { lastActiveAt: new Date() } })
      .catch(() => {});

    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return next(new UnauthorizedError('Invalid or expired token'));
    }
    next(err);
  }
}

function adminOnly(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    const { ForbiddenError } = require('../utils/errors');
    return next(new ForbiddenError('Admin access required'));
  }
  next();
}

module.exports = { authMiddleware, adminOnly };
