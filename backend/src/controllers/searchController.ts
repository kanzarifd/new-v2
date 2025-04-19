import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const searchReclamations = async (req: Request, res: Response): Promise<void> => {
  const { query } = req.query;
  if (!query || typeof query !== 'string' || !query.trim()) {
    res.status(400).json({ message: 'Query parameter is required.' });
    return;
  }
  const searchString = query.trim();
  try {
    const reclams = await prisma.reclam.findMany({
      where: {
        OR: [
          { title: { contains: searchString } },
          { description: { contains: searchString } },
        ],
      },
      include: { user: true, region: true },
    });
    res.json({ reclams });
  } catch (error: any) {
    console.error('Error performing search:', error);
    res.status(500).json({ message: `Error performing search: ${error.message}` });
  }
};