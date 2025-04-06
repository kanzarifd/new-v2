import express, { Router, Request, Response, NextFunction } from 'express';
import {
  addReclam,
  getAllReclams,
  getReclamById,
  updateReclam,
  deleteReclam,
} from '../controllers/reclamController';

const router: Router = express.Router();

// Helper function to wrap async controllers
const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) => (req: Request, res: Response, next: NextFunction) => {
  fn(req, res, next).catch(next);
};

// POST /api/reclams - Add new reclam
router.post('/', asyncHandler(async (req: Request, res: Response) => {
  await addReclam(req, res);
}));

// GET /api/reclams - Get all reclams
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  await getAllReclams(req, res);
}));

// GET /api/reclams/:id - Get reclam by ID
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  await getReclamById(req, res);
}));

// PUT /api/reclams/:id - Update reclam
router.put('/:id', asyncHandler(async (req: Request, res: Response) => {
  await updateReclam(req, res);
}));

// DELETE /api/reclams/:id - Delete reclam
router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  await deleteReclam(req, res);
}));

export { router };
