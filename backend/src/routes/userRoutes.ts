import express, { Router, Request, Response, NextFunction } from 'express';
import { 
  addUser, 
  getAllUsers, 
  getUserById, 
  updateUser, 
  login,
  requestPasswordReset,
  resetPassword,
  getUsersByRole,
  deleteUser
} from '../controllers/userController';

// Helper function to wrap async controllers
const asyncHandler = (
  fn: (req: Request, res: Response) => Promise<any>
) => (req: Request, res: Response, next: NextFunction) => {
  fn(req, res).catch((err: any) => {
    console.error('Route error:', {
      message: err.message,
      stack: err.stack,
      name: err.name
    });
    next(err);
  });
};

const router: Router = express.Router();

// User routes
router.post('/', asyncHandler(async (req: Request, res: Response) => {
  try {
    const response = await addUser(req, res);
    return response;
  } catch (error: any) {
    console.error('Route-level error:', error);
    throw error;
  }
}));

router.get('/', asyncHandler(async (req: Request, res: Response) => {
  try {
    const response = await getAllUsers(req, res);
    return response;
  } catch (error: any) {
    console.error('Route-level error:', error);
    throw error;
  }
}));

router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  try {
    const response = await deleteUser(req, res);
    return response;
  } catch (error: any) {
    console.error('Route-level error:', error);
    throw error;
  }
}));

router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  try {
    const response = await getUserById(req, res);
    return response;
  } catch (error: any) {
    console.error('Route-level error:', error);
    throw error;
  }
}));

router.put('/:id', asyncHandler(async (req: Request, res: Response) => {
  try {
    const response = await updateUser(req, res);
    return response;
  } catch (error: any) {
    console.error('Route-level error:', error);
    throw error;
  }
}));

// Auth routes
router.post('/login', asyncHandler(async (req: Request, res: Response) => {
  try {
    const response = await login(req, res);
    return response;
  } catch (error: any) {
    console.error('Route-level error:', error);
    throw error;
  }
}));

// Password reset routes
router.post('/password/reset', asyncHandler(async (req: Request, res: Response) => {
  try {
    const response = await requestPasswordReset(req, res);
    return response;
  } catch (error: any) {
    console.error('Route-level error:', error);
    throw error;
  }
}));

router.post('/password/reset/:token', asyncHandler(async (req: Request, res: Response) => {
  try {
    const response = await resetPassword(req, res);
    return response;
  } catch (error: any) {
    console.error('Route-level error:', error);
    throw error;
  }
}));

// Get users by role
router.get('/role/:role', asyncHandler(async (req: Request, res: Response) => {
  const { role } = req.params;
  const users = await getUsersByRole(req, res, role);
  res.json(users);
}));

export { router };
