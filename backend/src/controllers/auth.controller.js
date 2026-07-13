// Credit Book — Auth Controller
const authService = require('../services/auth.service');
const { successResponse } = require('../utils/response');

async function register(req, res, next) {
  try {
    const result = await authService.register(req.body);
    res.status(201).json(successResponse(result, 'Account created. Contact admin for activation.'));
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const userAgent = req.get('User-Agent');
    const ipAddress = req.ip || req.connection.remoteAddress;
    const result = await authService.login({ ...req.body, userAgent, ipAddress });
    res.json(successResponse(result, 'Login successful'));
  } catch (err) {
    next(err);
  }
}

async function refreshToken(req, res, next) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Refresh token required' } });
    }
    const result = await authService.refreshTokens(refreshToken);
    res.json(successResponse(result));
  } catch (err) {
    next(err);
  }
}

async function logout(req, res, next) {
  try {
    const { refreshToken } = req.body;
    await authService.logout(req.user.id, refreshToken);
    res.json(successResponse(null, 'Logged out successfully'));
  } catch (err) {
    next(err);
  }
}

async function logoutAll(req, res, next) {
  try {
    await authService.logoutAll(req.user.id);
    res.json(successResponse(null, 'All devices logged out'));
  } catch (err) {
    next(err);
  }
}

async function getSessions(req, res, next) {
  try {
    const sessions = await authService.getSessions(req.user.id);
    res.json(successResponse(sessions));
  } catch (err) {
    next(err);
  }
}

async function revokeSession(req, res, next) {
  try {
    await authService.revokeSession(req.user.id, req.params.sessionId);
    res.json(successResponse(null, 'Device removed successfully'));
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, refreshToken, logout, logoutAll, getSessions, revokeSession };
