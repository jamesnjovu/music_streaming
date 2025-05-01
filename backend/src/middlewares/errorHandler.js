const logger = require('../utils/logger');

// Export the module with both functions
module.exports = {
  /**
   * Custom error creator
   * @param {number} statusCode - HTTP status code
   * @param {string} message - Error message
   * @returns {Error} Custom error object
   */
  createError: (statusCode, message) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
  },

  /**
   * Global error handling middleware
   */
  errorHandler: (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    
    // Log error
    if (statusCode === 500) {
      logger.error(`[ERROR] ${req.method} ${req.url} - ${err.stack}`);
    } else {
      logger.warn(`[WARN] ${req.method} ${req.url} - ${message}`);
    }
    
    // Sequelize validation errors
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({
        message: 'Validation Error',
        errors: err.errors.map(e => ({
          field: e.path,
          message: e.message
        }))
      });
    }
    
    // Sequelize unique constraint errors
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        message: 'Duplicate Entry',
        errors: err.errors.map(e => ({
          field: e.path,
          message: e.message
        }))
      });
    }
    
    // Handle JWT errors
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({
        message: 'Invalid token'
      });
    }
    
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        message: 'Token expired'
      });
    }
    
    // Send error response
    res.status(statusCode).json({
      message,
      // Include stack trace in development mode
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  }
};