// Create this file at: /home/viper/Documents/other/music/backend/src/utils/errorHandler.js

/**
 * Custom error handler for API responses
 * @param {Error} err - Error object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @returns {Object} Error object with status code and message
 */
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;