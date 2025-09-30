// server\middleware\errorMiddleware.js
/**
 * @description Handles requests for routes that do not exist.
 */
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * @description A global error handler that catches all errors passed via `next(error)`.
 */
const errorHandler = (err, req, res, next) => {
  // Sometimes an error might come in with a 200 status code, so we adjust it.
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    // Provide stack trace only in development environment for debugging.
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

export { notFound, errorHandler };
