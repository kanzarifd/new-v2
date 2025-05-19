// routes/bancRoute.ts
import express from 'express';
import { verifyBanc } from '../controllers/bancController';

const router = express.Router();

// POST /api/banc/verify
router.post('/verify', verifyBanc);

export default router;