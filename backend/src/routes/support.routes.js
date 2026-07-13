// Credit Book — Support Routes
const router = require('express').Router();
const supportService = require('../services/support.service');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const { successResponse } = require('../utils/response');

// User: get their messages
router.get('/messages', authMiddleware, async (req, res, next) => {
  try {
    const result = await supportService.getMessages(req.user.id, req.query);
    res.json(successResponse(result));
  } catch (err) { next(err); }
});

// User: send message
router.post('/messages', authMiddleware, async (req, res, next) => {
  try {
    if (!req.body.message?.trim()) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Message cannot be empty' } });
    }
    const msg = await supportService.sendMessage(req.user.id, req.user.name, req.body.message);
    res.status(201).json(successResponse(msg));
  } catch (err) { next(err); }
});

// Admin: get all conversations
router.get('/conversations', authMiddleware, adminOnly, async (req, res, next) => {
  try {
    const conversations = await supportService.getAllConversations();
    res.json(successResponse(conversations));
  } catch (err) { next(err); }
});

// Admin: get a specific user's conversation
router.get('/conversations/:userId', authMiddleware, adminOnly, async (req, res, next) => {
  try {
    const result = await supportService.getConversation(req.params.userId, req.query);
    res.json(successResponse(result));
  } catch (err) { next(err); }
});

// Admin: reply to user
router.post('/conversations/:userId/reply', authMiddleware, adminOnly, async (req, res, next) => {
  try {
    if (!req.body.message?.trim()) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Message cannot be empty' } });
    }
    const msg = await supportService.adminReply(req.user.id, req.params.userId, req.body.message);
    res.status(201).json(successResponse(msg));
  } catch (err) { next(err); }
});

module.exports = router;
