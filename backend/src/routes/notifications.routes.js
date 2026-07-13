// Credit Book — Notifications Routes
const router = require('express').Router();
const notifService = require('../services/notifications.service');
const { authMiddleware } = require('../middleware/auth');
const { successResponse } = require('../utils/response');

router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const result = await notifService.getNotifications(req.user.id, req.query);
    res.json(successResponse(result));
  } catch (err) { next(err); }
});

router.get('/unread-count', authMiddleware, async (req, res, next) => {
  try {
    const count = await notifService.getUnreadCount(req.user.id);
    res.json(successResponse(count));
  } catch (err) { next(err); }
});

router.patch('/read-all', authMiddleware, async (req, res, next) => {
  try {
    await notifService.markAllRead(req.user.id);
    res.json(successResponse(null, 'All marked as read'));
  } catch (err) { next(err); }
});

router.patch('/:id/read', authMiddleware, async (req, res, next) => {
  try {
    await notifService.markRead(req.params.id, req.user.id);
    res.json(successResponse(null, 'Marked as read'));
  } catch (err) { next(err); }
});

router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    await notifService.deleteNotification(req.params.id, req.user.id);
    res.json(successResponse(null, 'Notification deleted'));
  } catch (err) { next(err); }
});

module.exports = router;
