// Credit Book — Custom Error Classes

class BaseError extends Error {
  constructor(code, message, statusCode, details = null) {
    super(message);
    this.code = code;
    this.message = message;
    this.statusCode = statusCode;
    this.details = details;
    this.name = this.constructor.name;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

class ValidationError extends BaseError {
  constructor(message = 'Validation failed', details = null) {
    super('VALIDATION_ERROR', message, 400, details);
  }
}

class UnauthorizedError extends BaseError {
  constructor(message = 'Unauthorized') {
    super('UNAUTHORIZED', message, 401);
  }
}

class ForbiddenError extends BaseError {
  constructor(message = 'Forbidden') {
    super('FORBIDDEN', message, 403);
  }
}

class NotFoundError extends BaseError {
  constructor(resource = 'Resource') {
    super('NOT_FOUND', `${resource} not found`, 404);
  }
}

class ConflictError extends BaseError {
  constructor(message = 'Conflict') {
    super('CONFLICT', message, 409);
  }
}

class InternalError extends BaseError {
  constructor(message = 'Internal server error') {
    super('INTERNAL_ERROR', message, 500);
  }
}

module.exports = {
  BaseError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  InternalError,
};
