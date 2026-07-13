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
    res.json(successResponse(null, 'Password changed successfully'));
  } catch (err) { next(err); }
});

router.delete('/me', authMiddleware, async (req, res, next) => {
  try {
    await usersService.deleteMe(req.user.id);
    res.json(successResponse(null, 'Account deleted'));
  } catch (err) { next(err); }
});

// Admin routes
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
