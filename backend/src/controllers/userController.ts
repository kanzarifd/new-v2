import { Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { isEmail } from 'validator';

const JWT_SECRET = process.env.JWT_SECRET || 'your-default-secret';

const prisma = new PrismaClient();

// ... (rest of the code remains the same)

export const addUser = async (req: Request, res: Response) => {
  try {
    // Log incoming request
    console.log('Incoming registration request:', JSON.stringify(req.body, null, 2));
    
    const { name, full_name, number, email, password, bank_account_number, bank_account_balance } = req.body;

    // Log field validation
    console.log('Validating required fields...');
    
    // Validate required fields
    if (!name || !full_name || !number || !email || !password || !bank_account_number || bank_account_balance === undefined) {
      console.log('Missing required fields:', {
        name: !name,
        full_name: !full_name,
        number: !number,
        email: !email,
        password: !password,
        bank_account_number: !bank_account_number,
        bank_account_balance: bank_account_balance === undefined
      });
      return res.status(400).json({
        message: 'Missing required fields',
        errors: {
          name: !name ? 'Name is required' : null,
          full_name: !full_name ? 'Full name is required' : null,
          number: !number ? 'Phone number is required' : null,
          email: !email ? 'Email is required' : null,
          password: !password ? 'Password is required' : null,
          bank_account_number: !bank_account_number ? 'Bank account number is required' : null,
          bank_account_balance: bank_account_balance === undefined ? 'Initial balance is required' : null
        }
      });
    }

    // Log email validation
    console.log('Validating email format...');
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('Invalid email format:', email);
      return res.status(400).json({
        message: 'Invalid email format',
        errors: { email: 'Please provide a valid email address' }
      });
    }

    // Log password validation
    console.log('Validating password strength...');
    
    // Validate password strength
    if (password.length < 6) {
      console.log('Password too short:', password.length);
      return res.status(400).json({
        message: 'Password too short',
        errors: { password: 'Password must be at least 6 characters long' }
      });
    }

    // Log balance validation
    console.log('Validating bank account balance...');
    
    // Validate bank account balance
    let parsedBalance: number;
    try {
      parsedBalance = parseFloat(bank_account_balance);
      if (isNaN(parsedBalance) || parsedBalance < 0) {
        throw new Error('Invalid balance');
      }
    } catch (err) {
      console.log('Invalid balance:', bank_account_balance);
      return res.status(400).json({
        message: 'Invalid bank account balance',
        errors: { bank_account_balance: 'Please enter a valid number for bank account balance' }
      });
    }

    // Log user existence check
    console.log('Checking if user exists...');
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      console.log('User already exists:', email);
      return res.status(400).json({
        message: 'Email already registered',
        errors: { email: 'This email is already registered' }
      });
    }

    // Log password hashing
    console.log('Hashing password...');
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Log user creation
    console.log('Creating user...');
    
    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        full_name,
        number,
        email,
        password: hashedPassword,
        bank_account_number,
        bank_account_balance: parsedBalance,
        role: 'user',
      },
    });

    console.log('User created successfully:', {
      id: user.id,
      email: user.email
    });

    // Remove sensitive data before sending response
    const { password: _, ...userData } = user;
    return res.status(201).json(userData);
  } catch (error: any) {
    console.error('Registration error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    // Return detailed error message for development
    return res.status(500).json({
      message: 'Registration failed',
      error: {
        type: error.name || 'UnknownError',
        message: error.message || 'Please check your details and try again.',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }
    });
  }
};

export const getAllUsers = async (_req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        full_name: true,
        number: true,
        email: true,
        bank_account_number: true,
        bank_account_balance: true,
        role: true,
      }
    });
    return res.json(users);
  } catch (err: any) {
    console.error('Error getting users:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        full_name: true,
        number: true,
        email: true,
        bank_account_number: true,
        bank_account_balance: true,
        role: true,
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json(user);
  } catch (err: any) {
    console.error('Error getting user:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const data = req.body;
    
    // Validate at least one field is provided
    if (Object.keys(data).length === 0) {
      return res.status(400).json({ message: 'No update data provided' });
    }

    // Create a new object for Prisma update with proper types
    const updateData: Prisma.UserUpdateInput = {
      ...data,
      bank_account_balance: data.bank_account_balance ? parseFloat(data.bank_account_balance) : undefined,
      role: data.role ? (data.role as 'user' | 'admin') : undefined
    };

    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        full_name: true,
        number: true,
        email: true,
        bank_account_number: true,
        bank_account_balance: true,
        role: true,
      }
    });

    return res.status(200).json({
      message: 'User updated successfully',
      user: updated
    });
  } catch (err: any) {
    console.error('Error updating user:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await prisma.user.delete({
      where: { id }
    });

    return res.json({ message: 'User deleted' });
  } catch (err: any) {
    console.error('Error deleting user:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        role: true,
        name: true,
        full_name: true,
        number: true
      }
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    try {
      const token = jwt.sign(
        { userId: user.id, role: user.role },
        JWT_SECRET,
        { expiresIn: '1h' }
      );

      // Prepare user data without password
      const userData = {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        full_name: user.full_name,
        number: user.number,
      };

      return res.json({
        message: 'Login successful',
        user: userData,
        token
      });
    } catch (jwtError) {
      console.error('JWT token generation error:', {
        message: jwtError.message,
        stack: jwtError.stack
      });
      return res.status(500).json({
        message: 'Failed to generate authentication token',
        error: 'JWT token generation failed'
      });
    }
  } catch (error: any) {
    console.error('Login error:', {
      message: error.message,
      stack: error.stack
    });
    
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message
    });
  }
};

export const requestPasswordReset = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    // Validate email format
    if (!isEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Find user by email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Update user with reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry
      }
    });

    // Send reset email
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Password Reset Request',
        html: `
          <h2>Password Reset Request</h2>
          <p>Click the link below to reset your password:</p>
          <a href="${resetUrl}">${resetUrl}</a>
        `
      });

      return res.status(200).json({ message: 'Password reset instructions sent to your email' });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      return res.status(500).json({ message: 'Failed to send password reset email' });
    }
  } catch (err: any) {
    console.error('Password reset error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;

    // Find user with matching reset token
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date()
        }
      }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user with new password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null
      }
    });

    return res.status(200).json({ message: 'Password reset successful' });
  } catch (err: any) {
    console.error('Password reset error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const verifyAccount = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    // Find user with matching verification token
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date()
        }
      }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid verification token' });
    }

    // Update user as verified
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: null,
        resetTokenExpiry: null
      }
    });

    return res.status(200).json({ message: 'Account verified successfully' });
  } catch (err: any) {
    console.error('Verification error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const resendVerification = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    // Validate email format
    if (!isEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        resetToken: true,
        resetTokenExpiry: true
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.resetToken) {
      return res.status(400).json({ message: 'Account is already verified' });
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Update user with new verification token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: verificationToken,
        resetTokenExpiry: new Date(Date.now() + 3600000) // 1 hour from now
      }
    });

    // Send verification email
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      const verificationUrl = `${process.env.FRONTEND_URL}/verify-account?token=${verificationToken}`;

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Account Verification Request',
        html: `
          <h2>Account Verification Request</h2>
          <p>Click the link below to verify your account:</p>
          <a href="${verificationUrl}">${verificationUrl}</a>
        `
      });

      return res.status(200).json({ message: 'Verification email sent' });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      return res.status(500).json({ message: 'Failed to send verification email' });
    }
  } catch (err: any) {
    console.error('Resend verification error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};