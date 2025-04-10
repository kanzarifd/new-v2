import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { Priority } from '../types/reclam';

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

    // Validate required fields
    if (!title || !description || !status || !priority || !date_debut || !region_id || !user_id) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Validate region
    const region = await prisma.region.findUnique({ where: { id: Number(region_id) } });
    if (!region) {
      return res.status(404).json({ error: 'Region not found' });
    }

    // Validate user
    const user = await prisma.user.findUnique({ where: { id: Number(user_id) } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const newReclam = await prisma.reclam.create({
      data: {
        title,
        description,
        status,
        priority,
        date_debut: new Date(date_debut),
        date_fin: date_fin ? new Date(date_fin) : undefined,
        region: { connect: { id: Number(region_id) } },
        user: { connect: { id: Number(user_id) } },
      },
    });

    return res.status(201).json(newReclam);
  } catch (error: any) {
    console.error('Error in addReclam:', error);
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

export const getReclamsByRegion = async (req: Request, res: Response) => {
  try {
    const regionId = Number(req.params.regionId);

    if (isNaN(regionId)) {
      return res.status(400).json({ error: 'Invalid region ID' });
    }

    // First get reclamations without including user
    const reclams = await prisma.reclam.findMany({
      where: { region_id: regionId },
      include: {
        region: true
      }
    });

    // Now fetch valid users for each reclam
    const reclamsWithUsers = await Promise.all(
      reclams.map(async (reclam) => {
        try {
          const user = await prisma.user.findUnique({
            where: { id: reclam.user_id }
          });

          if (!user) {
            console.log(`Warning: Reclamation ${reclam.id} has invalid user reference: ${reclam.user_id}`);
            return null;
          }

          return {
            ...reclam,
            user,
            region: reclam.region
          };
        } catch (error) {
          console.error(`Error fetching user for reclam ${reclam.id}:`, error);
          return null;
        }
      })
    );

    // Filter out null values (invalid reclams)
    const validReclams = reclamsWithUsers.filter((reclam): reclam is typeof reclams[0] & {
      user: {
        id: number;
        name: string;
        email: string;
      }
    } => reclam !== null);

    // If we found any valid reclams, return them
    if (validReclams.length > 0) {
      return res.json(validReclams);
    }

    // If we found no reclams at all
    if (reclams.length === 0) {
      return res.status(404).json({ message: 'No reclamations found for this region' });
    }

    // If we found reclams but all had invalid users
    return res.status(200).json([]);
  } catch (error: any) {
    console.error('Error in getReclamsByRegion:', error);
    return res.status(500).json({ error: error.message });
  }
};

export const getReclamsByPriority = async (req: Request, res: Response) => {
  try {
    const priorityParam = req.params.priority.toLowerCase();
    const validPriorities = Object.values(Priority);

    if (!validPriorities.includes(priorityParam as Priority)) {
      return res.status(400).json({ error: 'Invalid priority. Must be one of: low, medium, high' });
    }

    const reclams = await prisma.reclam.findMany({
      where: {
        priority: {
          equals: priorityParam as Priority
        }
      },
      include: {
        user: true,
        region: true
      }
    });

    if (reclams.length === 0) {
      return res.status(404).json({ message: 'No reclamations found with this priority' });
    }

    return res.json(reclams);
  } catch (error: any) {
    console.error('Error in getReclamsByPriority:', error);
    return res.status(500).json({ error: error.message });
  }
};

export const updateReclamStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  // Define valid status values
  const validStatuses = ['pending', 'in_progress', 'resolved', 'closed'];

  try {
    // Validate status
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be one of: pending, in_progress, resolved, closed' });
    }

    // Check if reclam exists
    const existingReclam = await prisma.reclam.findUnique({
      where: { id: Number(id) }
    });

    if (!existingReclam) {
      return res.status(404).json({ error: 'Reclamation not found' });
    }

    // Update the status
    const updatedReclam = await prisma.reclam.update({
      where: { id: Number(id) },
      data: { status }
    });

    res.json(updatedReclam);
  } catch (error) {
    console.error('Error updating reclamation status:', error);
    res.status(500).json({ error: 'Failed to update reclamation status' });
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
      regionId,
      userId,
    } = req.body;

    // Validate required fields
    if (!title || !description || !status || !priority || !date_debut || !regionId || !userId) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Validate region
    const region = await prisma.region.findUnique({ where: { id: Number(regionId) } });
    if (!region) {
      return res.status(404).json({ error: 'Region not found' });
    }

    // Validate user
    const user = await prisma.user.findUnique({ where: { id: Number(userId) } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Validate reclam exists and check status
    const existingReclam = await prisma.reclam.findUnique({ where: { id } });
    if (!existingReclam) {
      return res.status(404).json({ error: 'Reclamation not found' });
    }

    // Check if reclam can be updated based on status
    if (existingReclam.status !== 'pending') {
      return res.status(400).json({ error: 'Cannot update reclamation: it is currently in progress' });
    }

    const updatedReclam = await prisma.reclam.update({
      where: { id },
      data: {
        title,
        description,
        status,
        priority,
        date_debut: new Date(date_debut),
        date_fin: date_fin ? new Date(date_fin) : undefined,
        region: { connect: { id: Number(regionId) } },
        user: { connect: { id: Number(userId) } },
      },
    });

    return res.json(updatedReclam);
  } catch (error: any) {
    console.error('Error in updateReclam:', error);
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