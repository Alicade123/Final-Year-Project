// src/middleware/errorHandler.js

/**
 * Not Found Handler
 */
exports.notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * Global Error Handler
 */
exports.errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  // Log error for debugging
  console.error("Error:", {
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? "🥞" : err.stack,
    path: req.path,
    method: req.method,
  });

  // Database errors
  if (err.code === "23505") {
    // Unique violation
    return res.status(409).json({
      error: "Duplicate entry",
      message: "A record with this information already exists",
      ...(process.env.NODE_ENV === "development" && { detail: err.detail }),
    });
  }

  if (err.code === "23503") {
    // Foreign key violation
    return res.status(400).json({
      error: "Invalid reference",
      message: "Referenced record does not exist",
      ...(process.env.NODE_ENV === "development" && { detail: err.detail }),
    });
  }

  if (err.code === "23502") {
    // Not null violation
    return res.status(400).json({
      error: "Missing required field",
      message: "A required field is missing",
      ...(process.env.NODE_ENV === "development" && { detail: err.detail }),
    });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      error: "Invalid token",
      message: "Authentication token is invalid",
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      error: "Token expired",
      message: "Authentication token has expired",
    });
  }

  // Validation errors
  if (err.name === "ValidationError") {
    return res.status(400).json({
      error: "Validation error",
      message: err.message,
      ...(err.errors && { errors: err.errors }),
    });
  }

  // Default error response
  res.status(statusCode).json({
    error: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

/**
 * Async Handler Wrapper
 * Wraps async route handlers to catch errors
 */
exports.asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
