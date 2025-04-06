import express, { Router, Request, Response, NextFunction } from 'express';
import {
  addRegion,
  getAllRegions,
  getRegionById,
  updateRegion,
  deleteRegion,
} from '../controllers/regionController';

const router: Router = express.Router();

// Helper function to wrap async controllers
const asyncHandler = (
  fn: (req: Request, res: Response) => Promise<void>
) => (req: Request, res: Response, next: NextFunction) => {
  fn(req, res).catch(next);
};

// POST /api/regions - Add new region
router.post('/', asyncHandler(async (req: Request, res: Response) => {
  await addRegion(req, res);
}));

// GET /api/regions - Get all regions
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  await getAllRegions(req, res);
}));

// GET /api/regions/:id - Get region by ID
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  await getRegionById(req, res);
}));

// PUT /api/regions/:id - Update region
router.put('/:id', asyncHandler(async (req: Request, res: Response) => {
  await updateRegion(req, res);
}));

// DELETE /api/regions/:id - Delete region
router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  await deleteRegion(req, res);
}));

export { router };
