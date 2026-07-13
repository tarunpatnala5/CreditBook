// Credit Book — Auth Routes
const router = require('express').Router();
const authController = require('../controllers/auth.controller');
const { authMiddleware } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, error: { code: 'RATE_LIMITED', message: 'Too many attempts. Try again in 15 minutes.' } },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/register', authLimiter, authController.register);
router.post('/login', authLimiter, authController.login);
router.post('/refresh', authController.refreshToken);
router.post('/logout', authMiddleware, authController.logout);
router.post('/logout-all', authMiddleware, authController.logoutAll);
router.get('/sessions', authMiddleware, authController.getSessions);
router.delete('/sessions/:sessionId', authMiddleware, authController.revokeSession);

module.exports = router;
