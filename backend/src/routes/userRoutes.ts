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
  deleteUser,
  changePassword,
  createUser,
  updateAgent,
  forgotPassword
} from '../controllers/userController';
import { PrismaClient } from '@prisma/client';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';
const prisma = new PrismaClient();

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

// Change password route
router.patch('/:id/change-password', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    await changePassword(req, res);
  } catch (error) {
    next(error);
  }
}));


// updated agents 
router.put('/agent/:id', updateAgent);


// get agents
router.get('/agents', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getAgents(req, res);
  } catch (error) {
    next(error);
  }
}));


router.post('/register', createUser);


// Auth routes
router.post('/login', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    await login(req, res);
  } catch (error) {
    next(error);
  }
}));

// Forgot Password Route
router.post('/forgot-password', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    await forgotPassword(req, res);
  } catch (error) {
    next(error);
  }
}));

// Reset Password Route
router.post('/reset-password/:token', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    await resetPassword(req, res);
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

// Get current authenticated user profile
router.get('/me', asyncHandler(async (req: Request, res: Response) => {
  // TODO: Replace with actual auth-derived user ID
  // For now, using a placeholder ID from headers or default to 1
  const userId = Number(req.headers['x-user-id'] || 1);
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      name: true,
      email: true,
      full_name: true,
      number: true,
      bank_account_number: true,
      bank_account_balance: true,
      createdAt: true,
      updatedAt: true,
      role: true,
      regionId: true
    }
  });
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
}));

export { router };
  function getAgents(req: express.Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>, res: express.Response<any, Record<string, any>>) {
    throw new Error('Function not implemented.');
  }

