// Credit Book — Analytics Routes (Admin)
const router = require('express').Router();
const analyticsService = require('../services/analytics.service');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const { successResponse } = require('../utils/response');

router.get('/dashboard', authMiddleware, adminOnly, async (req, res, next) => {
  try {
    const stats = await analyticsService.getDashboardStats();
    res.json(successResponse(stats));
  } catch (err) { next(err); }
});

module.exports = router;
