// src/middleware/validation.js

/**
 * Validate product registration
 */
exports.validateProductRegistration = (req, res, next) => {
  const { farmerId, produceName, quantity, unit, pricePerUnit } = req.body;
  const errors = [];

  if (!farmerId || typeof farmerId !== "string") {
    errors.push("Valid farmerId is required");
  }

  if (
    !produceName ||
    typeof produceName !== "string" ||
    produceName.trim().length === 0
  ) {
    errors.push("Valid produceName is required");
  }

  if (!quantity || isNaN(quantity) || parseFloat(quantity) <= 0) {
    errors.push("Valid quantity (positive number) is required");
  }

  if (!unit || typeof unit !== "string" || unit.trim().length === 0) {
    errors.push("Valid unit is required");
  }

  if (!pricePerUnit || isNaN(pricePerUnit) || parseFloat(pricePerUnit) <= 0) {
    errors.push("Valid pricePerUnit (positive number) is required");
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};

/**
 * Validate product update
 */
exports.validateProductUpdate = (req, res, next) => {
  const { quantity, pricePerUnit, status } = req.body;
  const errors = [];

  if (quantity !== undefined && (isNaN(quantity) || parseFloat(quantity) < 0)) {
    errors.push("Quantity must be a non-negative number");
  }

  if (
    pricePerUnit !== undefined &&
    (isNaN(pricePerUnit) || parseFloat(pricePerUnit) < 0)
  ) {
    errors.push("Price per unit must be a non-negative number");
  }

  if (
    status !== undefined &&
    !["AVAILABLE", "RESERVED", "SOLD", "EXPIRED"].includes(status)
  ) {
    errors.push("Status must be one of: AVAILABLE, RESERVED, SOLD, EXPIRED");
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};

/**
 * Validate order status update
 */
exports.validateOrderStatus = (req, res, next) => {
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: "Status is required" });
  }

  if (!["PENDING", "PAID", "FULFILLED", "CANCELLED"].includes(status)) {
    return res.status(400).json({
      error:
        "Invalid status. Must be one of: PENDING, PAID, FULFILLED, CANCELLED",
    });
  }

  next();
};

/**
 * Validate UUID parameter
 */
exports.validateUUID = (paramName) => {
  return (req, res, next) => {
    const uuid = req.params[paramName];
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (!uuid || !uuidRegex.test(uuid)) {
      return res.status(400).json({ error: `Invalid ${paramName} format` });
    }

    next();
  };
};

/**
 * Validate pagination parameters
 */
exports.validatePagination = (req, res, next) => {
  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);

  if (req.query.page && (isNaN(page) || page < 1)) {
    return res.status(400).json({ error: "Page must be a positive integer" });
  }

  if (req.query.limit && (isNaN(limit) || limit < 1 || limit > 100)) {
    return res.status(400).json({ error: "Limit must be between 1 and 100" });
  }

  next();
};

/**
 * Validate date range
 */
exports.validateDateRange = (req, res, next) => {
  const { startDate, endDate } = req.query;

  if (startDate && isNaN(Date.parse(startDate))) {
    return res.status(400).json({ error: "Invalid startDate format" });
  }

  if (endDate && isNaN(Date.parse(endDate))) {
    return res.status(400).json({ error: "Invalid endDate format" });
  }

  if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
    return res.status(400).json({ error: "startDate must be before endDate" });
  }

  next();
};

/**
 * Validate hub settings update
 */
exports.validateHubSettings = (req, res, next) => {
  const { name, location } = req.body;
  const errors = [];

  if (
    name !== undefined &&
    (typeof name !== "string" || name.trim().length === 0)
  ) {
    errors.push("Name must be a non-empty string");
  }

  if (
    location !== undefined &&
    (typeof location !== "string" || location.trim().length === 0)
  ) {
    errors.push("Location must be a non-empty string");
  }

  if (Object.keys(req.body).length === 0) {
    errors.push("At least one field must be provided for update");
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};
