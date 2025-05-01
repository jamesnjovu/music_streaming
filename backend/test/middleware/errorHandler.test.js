const { createError, errorHandler } = require('../../src/middlewares/errorHandler');

describe('Error Handler Middleware', () => {
  describe('createError', () => {
    it('should create an error with status code and message', () => {
      const statusCode = 404;
      const message = 'Not Found';
      
      const error = createError(statusCode, message);
      
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe(message);
      expect(error.statusCode).toBe(statusCode);
    });
  });

  describe('errorHandler middleware', () => {
    let req, res, next;
    
    beforeEach(() => {
      req = {
        method: 'GET',
        url: '/test'
      };
      
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      
      next = jest.fn();
    });
    
    it('should handle custom errors with correct status code', () => {
      const err = createError(400, 'Bad Request');
      
      errorHandler(err, req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Bad Request'
      });
    });
    
    it('should default to 500 status if no statusCode is provided', () => {
      const err = new Error('Some error');
      
      errorHandler(err, req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Some error'
      });
    });
  });
});