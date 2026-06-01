import { fail } from './api-response.js';

function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return fail(res, 'Resource already exists', 409);
  }

  if (err.name === 'SequelizeValidationError') {
    const message =
      err.errors?.map((e) => e.message).join(', ') || err.message;
    return fail(res, message, 400);
  }

  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return fail(res, 'Invalid reference id', 400);
  }

  const status = err.status || err.statusCode || 500;
  const message = status === 500 ? 'Internal server error' : err.message;
  return fail(res, message, status);
}

function notFoundHandler(req, res) {
  return fail(res, 'Route not found', 404);
}

/** Wrap async route handlers — pass errors to errorHandler via next(err). */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export default errorHandler;
export { notFoundHandler, asyncHandler };
