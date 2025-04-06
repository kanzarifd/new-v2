import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function parseDate(dateString: string): Date | null {
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
}

export const addReclam = async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      status,
      priority,
      date_debut,
      date_fin,
      region_id,
      user_id,
    } = req.body;

    const newReclam = await prisma.reclam.create({
      data: {
        title,
        description,
        status,
        priority,
        date_debut: new Date(date_debut),
        date_fin: date_fin ? new Date(date_fin) : undefined,
        region_id,
        user_id,
      },
    });
    return res.status(201).json(newReclam);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getAllReclams = async (_: Request, res: Response) => {
  try {
    const reclams = await prisma.reclam.findMany();
    return res.json(reclams);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getReclamById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const reclam = await prisma.reclam.findUnique({ where: { id } });
    if (!reclam) {
      return res.status(404).json({ message: 'Reclamation not found' });
    }
    return res.json(reclam);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const updateReclam = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const {
      title,
      description,
      status,
      priority,
      date_debut,
      date_fin,
      region_id,
      user_id,
    } = req.body;

    // Create update data object with only provided fields
    const updateData: any = {};

    // Add non-date fields if provided
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (priority !== undefined) updateData.priority = priority;

    // Only validate and add dates if they are provided
    if (date_debut !== undefined) {
      const debutDate = parseDate(date_debut);
      if (!debutDate) {
        return res.status(400).json({ 
          error: 'Invalid date_debut format. Please provide a valid date in ISO format (YYYY-MM-DD)' 
        });
      }
      updateData.date_debut = debutDate;
    }

    if (date_fin !== undefined) {
      const finDate = parseDate(date_fin);
      if (!finDate) {
        return res.status(400).json({ 
          error: 'Invalid date_fin format. Please provide a valid date in ISO format (YYYY-MM-DD)' 
        });
      }
      updateData.date_fin = finDate;
    }

    // Only add region/user if they exist and are not null/undefined
    if (region_id !== undefined && region_id !== null) {
      const region = await prisma.region.findUnique({ where: { id: Number(region_id) } });
      if (!region) {
        return res.status(404).json({ 
          error: 'Region not found' 
        });
      }
      updateData.region = { connect: { id: Number(region_id) } };
    }

    if (user_id !== undefined && user_id !== null) {
      const user = await prisma.user.findUnique({ where: { id: Number(user_id) } });
      if (!user) {
        return res.status(404).json({ 
          error: 'User not found' 
        });
      }
      updateData.user = { connect: { id: Number(user_id) } };
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ 
        error: 'No fields to update were provided' 
      });
    }

    const updated = await prisma.reclam.update({
      where: { id },
      data: updateData,
    });
    return res.json(updated);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const deleteReclam = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await prisma.reclam.delete({ where: { id } });
    return res.json({ message: 'Reclamation deleted' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
