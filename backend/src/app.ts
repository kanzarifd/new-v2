import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import { router as userRoutes } from './routes/userRoutes';
import { router as regionRoutes } from './routes/regionRoutes';
import { router as reclamRoutes } from './routes/reclamRoutes';

dotenv.config();
const app = express();

// Set default JWT_SECRET for development
if (!process.env.JWT_SECRET) {
  console.warn('JWT_SECRET not set in environment variables. Using development secret.');
  process.env.JWT_SECRET = 'dev_secret_1234567890';
}

app.use(cors());
app.use(express.json());

// Error handling middleware
const errorHandler = (
  err: Error,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  console.error('Error handler:', {
    message: err.message,
    stack: err.stack,
    name: err.name
  });

  if (err instanceof Error) {
    // If we have a response with errors, return them
    if (err.message.includes('errors')) {
      res.status(400).json({
        message: 'Validation failed',
        errors: JSON.parse(err.message)
      });
    } else {
      // Return detailed error message for development
      res.status(500).json({
        message: err.message,
        error: {
          type: err.name || 'UnknownError',
          details: process.env.NODE_ENV === 'development' ? err.stack : undefined
        }
      });
    }
  } else {
    // Fallback to generic error
    res.status(500).json({
      message: 'Internal server error',
      error: {
        details: process.env.NODE_ENV === 'development' ? 'An unexpected error occurred' : undefined
      }
    });
  }
};

// Global error handler for async functions
const asyncErrorHandler = (fn: any) => {
  return function (req: express.Request, res: express.Response, next: express.NextFunction) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Apply middleware to all routes
app.use('/api/users', asyncErrorHandler(userRoutes));
app.use('/api/regions', asyncErrorHandler(regionRoutes));
app.use('/api/reclams', asyncErrorHandler(reclamRoutes));

// Register error handler as Express error handling middleware
app.use(errorHandler as express.ErrorRequestHandler);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
