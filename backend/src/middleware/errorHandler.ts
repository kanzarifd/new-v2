import { Request, Response } from 'express';

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response) => {
  console.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    status: err.status,
    name: err.name
  });

  const status = err.status || 500;
  const message = err.message || 'Internal server error';

  // For development, include error details but prevent circular references
  if (process.env.NODE_ENV === 'development') {
    const errorDetails = {
      status,
      message,
      error: {
        name: err.name,
        message: err.message,
        stack: err.stack
      }
    };
    
    try {
      JSON.stringify(errorDetails); // Test for circular references
      res.status(status).json(errorDetails);
    } catch {
      res.status(status).json({
        status,
        message,
        error: 'Error details could not be serialized due to circular references'
      });
    }
  } else {
    // For production, only show generic error
    res.status(status).json({
      status,
      message
    });
  }
};
