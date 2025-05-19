import express, { Request, Response, NextFunction } from 'express';
import { forgotPassword, resetPassword } from '../controllers/authController';

const router = express.Router();

router.post('/forgot-password', (req: Request<{}, {}, { email: string }>, res: Response, next: NextFunction) => {
    forgotPassword(req, res).catch(next);
});

router.post('/reset-password/:token', (req: Request<{ token: string }, {}, { newPassword: string }>, res: Response, next: NextFunction) => {
    resetPassword(req, res).catch(next);
});

export default router;
