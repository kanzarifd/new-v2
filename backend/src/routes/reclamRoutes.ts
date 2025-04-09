import express, { Router, Request, Response, NextFunction } from 'express';
import {
  addReclam,
  deleteReclam,
  getAllReclams,
  getReclamById,
  getReclamsByPriority,
  getReclamsByRegion,
  updateReclam
} from '../controllers/reclamController';

const router: Router = express.Router();

const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) => (req: Request, res: Response, next: NextFunction) => {
  fn(req, res, next).catch(next);
};

// GET /api/reclams - Get all reclams with optional priority filtering
router.get('/', asyncHandler(async (req, res) => {
  await getAllReclams(req, res);
}));

// Get reclamations by region
router.get('/region/:regionId', asyncHandler(async (req, res) => {
  await getReclamsByRegion(req, res);
}));

// Get reclamations by priority
router.get('/priority/:priority', asyncHandler(async (req, res) => {
  await getReclamsByPriority(req, res);
}));

router.post('/', asyncHandler(async (req, res) => {
  await addReclam(req, res);
}));

router.get('/:id', asyncHandler(async (req, res) => {
  await getReclamById(req, res);
}));

router.put('/:id', asyncHandler(async (req, res) => {
  await updateReclam(req, res);
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  await deleteReclam(req, res);
}));

export { router };