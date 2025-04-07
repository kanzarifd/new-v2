import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    status: err.status,
    name: err.name
  });

  const status = err.status || 500;
  const message = err.message || 'Internal server error';

  // For development, include error details
  if (process.env.NODE_ENV === 'development') {
    res.status(status).json({
      status,
      message,
      error: err,
      stack: err.stack
    });
  } else {
    // For production, only show generic error
    res.status(status).json({
      status,
      message
    });
  }
};
