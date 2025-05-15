import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper function to validate and parse dates
const parseDate = (dateString: string | undefined): Date | null => {
  if (!dateString) return null;
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return null;
  }
  return date;
};

export const addRegion = async (req: Request, res: Response) => {
  try {
    const { name, date_debut } = req.body;
          
    // Validate dates
    const debutDate = parseDate(date_debut);

    if (!debutDate) {
      return res.status(400).json({ 
        error: 'Invalid date format. Please provide valid dates in ISO format (YYYY-MM-DD)' 
      });
    }

    const newRegion = await prisma.region.create({
      data: {
        name,
        date_debut: debutDate,
      },
    });
    return res.status(201).json(newRegion);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getAllRegions = async (_: Request, res: Response) => {
  try {
    const regions = await prisma.region.findMany();
    return res.json(regions);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getRegionById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const region = await prisma.region.findUnique({ where: { id } });
    if (!region) {
      return res.status(404).json({ message: 'Region not found' });
    }
    return res.json(region);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const updateRegion = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { name, date_debut } = req.body;
    
    // Create update data object with only provided fields
    const updateData: any = { name };
    
    // Only validate and add dates if they are provided
    if (date_debut) {
      const debutDate = parseDate(date_debut);
      if (!debutDate) {
        return res.status(400).json({ 
          error: 'Invalid date_debut format. Please provide a valid date in ISO format (YYYY-MM-DD)' 
        });
      }
      updateData.date_debut = debutDate;
    }

   

    const updated = await prisma.region.update({
      where: { id },
      data: updateData,
    });
    return res.json(updated);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const deleteRegion = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await prisma.region.delete({ where: { id } });
    return res.json({ message: 'Region deleted' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
