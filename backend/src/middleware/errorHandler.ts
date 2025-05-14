import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  try {
    // Log the error
    console.error('Error occurred:', {
      message: err.message,
      stack: err.stack,
      status: err.status,
      name: err.name
    });

    // Get the status code
    const status = err.status || 500;
    
    // Create a safe error response object
    const errorResponse = {
      status,
      message: err.message || 'Internal server error',
      ...(err.name && { name: err.name }),
      ...(err.stack && { stack: err.stack }),
      ...(err.details && { details: err.details })
    };

    // Send the error response
    res.status(status).json(errorResponse);
  } catch (error) {
    console.error('Error in error handler:', error);
    // Fallback to a simple error response if something goes wrong in the error handler
    res.status(500).json({
      status: 500,
      message: 'Internal server error'
    });
  }
};
