import { Request } from 'express';
import { DecodedIdToken } from 'firebase-admin/auth';
import { Session } from 'express-session';

// Extend Express Request type to include user and session properties
declare namespace Express {
  interface Request {
    user?: {
      id: number;
      [key: string]: any;
    };
  }
}

// For type safety when using the user object
export interface AuthenticatedRequest extends Request {
  user: {
    id: number;
    [key: string]: any;
  };
}
