// Credit Book — Analytics Routes (Admin)
const router = require('express').Router();
const analyticsService = require('../services/analytics.service');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const { successResponse } = require('../utils/response');

router.get('/dashboard', authMiddleware, adminOnly, async (req, res, next) => {
  try {
    // Always fetch fresh — no CDN/proxy caching
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    const stats = await analyticsService.getDashboardStats();
    res.json(successResponse(stats));
  } catch (err) { next(err); }
});

module.exports = router;
