import express, { Router, Request, Response, NextFunction } from 'express';
import {
  addReclam,
  deleteReclam,
  getAllReclams,
  getReclamById,
  getReclamsByPriority,
  getReclamsByRegion,
  updateReclamStatus,
  updateReclam,
  getReclamsByUserRegion,
} from '../controllers/reclamController';
import { PrismaClient } from '@prisma/client';
import upload from '../middleware/upload';


const prisma = new PrismaClient();

const router: Router = express.Router();

const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) => (req: Request, res: Response, next: NextFunction) => {
  fn(req, res, next).catch(next);
};

// GET /api/reclams - Get all reclams
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

// Add new reclam
router.post('/', upload.single('attachment'), asyncHandler(async (req, res) => {
  await addReclam(req, res);
}));

// Get reclam by ID
router.get('/:id', asyncHandler(async (req, res) => {
  await getReclamById(req, res);
}));


//agents reclmas

router.get('/by-user-region/:userId', getReclamsByUserRegion);


// Update reclam by ID
router.put('/:id', upload.single('attachment'), asyncHandler(async (req, res) => {
  await updateReclam(req, res);
}));

// Delete reclam by ID
router.delete('/:id', asyncHandler(async (req, res) => {
  await deleteReclam(req, res);
}));

// Update status of a reclamation
router.put('/status/:id', asyncHandler(async (req, res) => {
  await updateReclamStatus(req, res);
}));

// Get reclamations statistics
router.get('/stats', asyncHandler(async (_req: Request, res: Response) => {
  const reclamsStats = await prisma.reclam.groupBy({
    by: ['status', 'priority'],
    _count: true,
  });

  const totalReclams = reclamsStats.reduce((acc, curr) => acc + curr._count, 0);

  const stats = {
    total: totalReclams,
    byStatus: {
      pending: reclamsStats.find((r) => r.status === 'pending')?._count || 0,
      in_progress: reclamsStats.find((r) => r.status === 'in_progress')?._count || 0,
      resolved: reclamsStats.find((r) => r.status === 'resolved')?._count || 0,
      closed: reclamsStats.find((r) => r.status === 'closed')?._count || 0,
    },
    byPriority: {
      high: reclamsStats.find((r) => r.priority === 'high')?._count || 0,
      medium: reclamsStats.find((r) => r.priority === 'medium')?._count || 0,
      low: reclamsStats.find((r) => r.priority === 'low')?._count || 0,
    },
  };

  res.json(stats);
}));

export { router };