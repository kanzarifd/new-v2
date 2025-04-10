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
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => (req: Request, res: Response, next: NextFunction) => {
  fn(req, res, next).catch(next);
};

const router: Router = express.Router();

// User routes
router.post('/', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    await addUser(req, res);
  } catch (error) {
    next(error);
  }
}));

router.get('/', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getAllUsers(req, res);
  } catch (error) {
    next(error);
  }
}));

router.delete('/:id', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    await deleteUser(req, res);
  } catch (error) {
    next(error);
  }
}));

router.get('/:id', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getUserById(req, res);
  } catch (error) {
    next(error);
  }
}));

router.put('/:id', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    await updateUser(req, res);
  } catch (error) {
    next(error);
  }
}));

// Auth routes
router.post('/login', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    await login(req, res);
  } catch (error) {
    next(error);
  }
}));

// Password reset routes
router.post('/password/reset', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    await requestPasswordReset(req, res);
  } catch (error) {
    next(error);
  }
}));

router.post('/password/reset/:token', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    await resetPassword(req, res);
  } catch (error) {
    next(error);
  }
}));

// Get users by role
router.get('/role/:role', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { role } = req.params;
    const users = await getUsersByRole(req, res, role);
    res.json(users);
  } catch (error) {
    next(error);
  }
}));

export { router };
