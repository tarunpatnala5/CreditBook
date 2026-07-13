// Credit Book — Global Error Handler
const { BaseError } = require('../utils/errors');
const { errorResponse } = require('../utils/response');

function errorHandler(err, req, res, next) {
  // Log error
  const isDev = process.env.NODE_ENV !== 'production';
  console.error(`[ERROR] ${err.name}: ${err.message}${isDev ? '\n' + err.stack : ''}`);

  // Known application errors
  if (err instanceof BaseError) {
    return res.status(err.statusCode).json(errorResponse(err.code, err.message, err.details));
  }

  // JWT errors (handle here as well as middleware)
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json(errorResponse('UNAUTHORIZED', 'Invalid or expired token'));
  }

  // Prisma unique constraint violation
  if (err.code === 'P2002') {
    const field = err.meta?.target?.[0] || 'field';
    return res.status(409).json(errorResponse('CONFLICT', `${field} already exists`));
  }

  // Prisma record not found
  if (err.code === 'P2025') {
    return res.status(404).json(errorResponse('NOT_FOUND', 'Record not found'));
  }

  // Generic server error
  return res.status(500).json(
    errorResponse('INTERNAL_ERROR', isDev ? err.message : 'Something went wrong. Please try again.')
  );
}

function notFoundHandler(req, res) {
  res.status(404).json(errorResponse('NOT_FOUND', `Route ${req.method} ${req.path} not found`));
}

module.exports = { errorHandler, notFoundHandler };
