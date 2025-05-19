// controllers/bancController.ts
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const verifyBanc = async (req: Request, res: Response): Promise<void> => {
  // Validate input
  const { cin, name } = req.body;

  // Detailed input validation
  if (!cin || typeof cin !== 'string') {
    res.status(400).json({ 
      exists: false, 
      message: 'Invalid CIN. Must be a non-empty string.',
      details: { cin: 'Invalid type or empty' } 
    });
    return;
  }

  if (!name || typeof name !== 'string') {
    res.status(400).json({ 
      exists: false, 
      message: 'Invalid name. Must be a non-empty string.',
      details: { name: 'Invalid type or empty' } 
    });
    return;
  }

  try {
    // Perform database query with additional error handling
    const banc = await prisma.banc.findFirst({
      where: { 
        cin: cin.trim(), 
        name: name.trim() 
      },
      select: {
        id: true,
        cin: true,
        name: true
      }
    });

    // Log verification attempt
    console.log('Banc Verification:', {
      cin,
      name,
      found: !!banc
    });

    // Return appropriate response
    if (banc) {
      res.json({ 
        exists: true, 
        details: { 
          id: banc.id, 
          cin: banc.cin, 
          name: banc.name 
        } 
      });
    } else {
      res.json({ 
        exists: false,
        message: 'No matching record found'
      });
    }
  } catch (error: unknown) {
    // Comprehensive error handling
    const errorDetails = error instanceof Error 
      ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        }
      : { message: String(error) };

    console.error('Verification Error:', {
      input: { cin, name },
      error: errorDetails
    });

    res.status(500).json({ 
      exists: false, 
      message: 'Internal server error', 
      error: errorDetails 
    });
  }
};