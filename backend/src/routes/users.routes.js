// Credit Book — Users Routes
const router = require('express').Router();
const usersService = require('../services/users.service');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const { successResponse } = require('../utils/response');

// Current user profile
router.get('/me', authMiddleware, async (req, res, next) => {
  try {
    const user = await usersService.getMe(req.user.id);
    res.json(successResponse(user));
  } catch (err) { next(err); }
});

router.patch('/me', authMiddleware, async (req, res, next) => {
  try {
    const user = await usersService.updateMe(req.user.id, req.body);
    res.json(successResponse(user));
  } catch (err) { next(err); }
});

router.post('/me/change-password', authMiddleware, async (req, res, next) => {
  try {
    await usersService.changePassword(req.user.id, req.body);
    res.json(successResponse(null, 'Password changed successfully. You have been signed out of all devices.'));
  } catch (err) { next(err); }
});

router.delete('/me', authMiddleware, async (req, res, next) => {
  try {
    await usersService.deleteMe(req.user.id);
    res.json(successResponse(null, 'Account deleted'));
  } catch (err) { next(err); }
});

// ─── Public: Forgot password (no auth needed) ─────────────────────────────
router.post('/forgot-password', async (req, res, next) => {
  try {
    await usersService.requestPasswordReset(req.body.phone);
    res.json(successResponse(null, 'Your request has been submitted'));
  } catch (err) { next(err); }
});

// ─── Public: Reset password with one-time token ──────────────────────────
router.post('/reset-password', async (req, res, next) => {
  try {
    await usersService.resetPassword(req.body.token, req.body.newPassword);
    res.json(successResponse(null, 'Password reset successfully. You can now sign in.'));
  } catch (err) { next(err); }
});

// ─── Admin routes ─────────────────────────────────────────────────────────
router.get('/', authMiddleware, adminOnly, async (req, res, next) => {
  try {
    const result = await usersService.getAllUsers(req.query);
    res.json(successResponse(result));
  } catch (err) { next(err); }
});

router.get('/pending', authMiddleware, adminOnly, async (req, res, next) => {
  try {
    const result = await usersService.getAllUsers({ status: 'pending' });
    res.json(successResponse(result));
  } catch (err) { next(err); }
});

// ─── Admin: Live badge counts ──────────────────────────────────────────────
router.get('/admin-counts', authMiddleware, adminOnly, async (req, res, next) => {
  try {
    const prisma = require('../config/database');
    const [pendingUsers, pendingReset, totalUsers] = await Promise.all([
      prisma.user.count({ where: { status: 'pending', deletedAt: null } }),
      prisma.passwordResetRequest.count({ where: { status: 'pending' } })
        .catch(() => 0),
      prisma.user.count({ where: { status: 'active', deletedAt: null } }),
    ]);
    res.json(successResponse({ pendingUsers, pendingReset, totalUsers }));
  } catch (err) { next(err); }
});

router.get('/password-reset-requests', authMiddleware, adminOnly, async (req, res, next) => {
  try {
    const result = await usersService.getPasswordResetRequests();
    res.json(successResponse(result));
  } catch (err) { next(err); }
});

router.patch('/password-reset-requests/:id/mark-sent', authMiddleware, adminOnly, async (req, res, next) => {
  try {
    await usersService.markResetSent(req.params.id);
    res.json(successResponse(null, 'Marked as sent'));
  } catch (err) { next(err); }
});

router.post('/:userId/activate', authMiddleware, adminOnly, async (req, res, next) => {
  try {
    await usersService.activateUser(req.params.userId, req.user.id);
    res.json(successResponse(null, 'User activated'));
  } catch (err) { next(err); }
});

router.post('/:userId/reject', authMiddleware, adminOnly, async (req, res, next) => {
  try {
    await usersService.rejectUser(req.params.userId, req.body.reason);
    res.json(successResponse(null, 'User rejected'));
  } catch (err) { next(err); }
});

router.delete('/:userId', authMiddleware, adminOnly, async (req, res, next) => {
  try {
    await usersService.deleteUser(req.params.userId, req.user.id);
    res.json(successResponse(null, 'User deleted'));
  } catch (err) { next(err); }
});

module.exports = router;
