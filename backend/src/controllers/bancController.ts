// controllers/bancController.ts
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const verifyBanc = async (req: Request, res: Response): Promise<void> => {
  const { cin, name } = req.body;

  if (!cin || !name) {
    res.status(400).json({ exists: false, message: 'CIN and name are required' });
    return;
  }

  try {
    const banc = await prisma.banc.findFirst({
      where: { cin, name },
    });

    if (banc) {
      res.json({ exists: true });
    } else {
      res.json({ exists: false });
    }
  } catch (error) {
    console.error('Error verifying banc:', error);
    res.status(500).json({ exists: false, message: 'Internal server error' });
  }
};
