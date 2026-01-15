import { Request, Response, NextFunction } from 'express';
import { logger } from '../util/logger';
import { CustomError } from '../util/CustomError';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  // Default error values
  let statusCode = 500;
  let message = 'Internal Server Error';

  // Handle custom errors
  if (err instanceof CustomError) {
    statusCode = err.statusCode;
    message = err.message;
  } else {
    // Handle known error types using switch-case
    switch (err.name) {
      case 'ValidationError':
        statusCode = 400;
        message = err.message;
        break;

      case 'UnauthorizedError':
        statusCode = 401;
        message = 'Unauthorized';
        break;

      default:
        // Check error message for specific patterns
        if (err.message) {
          switch (true) {
            case err.message === 'Unauthorized':
              statusCode = 401;
              message = 'Unauthorized';
              break;

            case err.message === 'Forbidden':
              statusCode = 403;
              message = 'Forbidden';
              break;

            case err.message.includes('not found'):
              statusCode = 404;
              message = err.message;
              break;

            default:
              // Use err.statusCode if available, otherwise use err.message
              if (err.statusCode) {
                statusCode = err.statusCode;
                message = err.message || message;
              } else {
                message = err.message;
              }
              break;
          }
        } else if (err.statusCode) {
          statusCode = err.statusCode;
          message = err.message || message;
        }
        break;
    }
  }

  // Log the error
  const clientIp = req.ip || req.socket.remoteAddress || req.headers['x-forwarded-for'] || 'unknown';
  logger.error('Error handled by error handler', err, {
    path: req.path,
    method: req.method,
    statusCode,
    userAgent: req.get('user-agent'),
    ip: clientIp
  });

  // Send error response
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      error: err
    })
  });
};

// 404 Not Found handler
export const notFoundHandler = (req: Request, res: Response) => {
  const clientIp = req.ip || req.socket.remoteAddress || req.headers['x-forwarded-for'] || 'unknown';
  logger.warn('404 Not Found', {
    path: req.path,
    method: req.method,
    ip: clientIp
  });

  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path
  });
};