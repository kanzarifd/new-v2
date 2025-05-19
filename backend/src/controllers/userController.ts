import { Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer, { Transporter, SentMessageInfo } from 'nodemailer';
import { isEmail } from 'validator';

const JWT_SECRET = process.env.JWT_SECRET || 'your-default-secret';

// Validate SMTP configuration
function validateSmtpConfig() {
  const errors: string[] = [];

  if (!process.env.EMAIL_USER) {
    errors.push('EMAIL_USER is not set');
  }

  if (!process.env.EMAIL_PASS) {
    errors.push('EMAIL_PASS is not set');
  }

  return errors;
}

// Configure nodemailer transporter with comprehensive error handling
let transporter: Transporter | null = null;
// Flag to indicate if email sending is in fallback mode due to configuration or verification issues
let emailSendingFallback = false;

try {
  const configErrors = validateSmtpConfig();
  if (configErrors.length > 0) {
    console.warn('SMTP Configuration Errors:', configErrors);
    emailSendingFallback = true;
  } else {
    transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER || '',
        pass: process.env.EMAIL_PASS || ''
      },
      // Fallback configuration
      tls: {
        rejectUnauthorized: false // Only use in development
      }
    });
  }
} catch (configError) {
  console.warn('Failed to create SMTP Transporter:', {
    error: configError instanceof Error ? configError.message : String(configError)
  });
  emailSendingFallback = true;
}

  // Verify transporter connection
  if (transporter) {
    transporter.verify((error) => {
      if (error) {
        console.error('SMTP Transporter Verification Failed:', {
          error: error.message,
          stack: error.stack
        });
        emailSendingFallback = true;
      } else {
        console.log('SMTP Transporter is ready to send emails');
      }
    });
  }


// Log transporter configuration for debugging
console.log('SMTP Transporter Configuration:', {
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  user: process.env.EMAIL_USER ? 'CONFIGURED' : 'NOT SET'
});

const prisma = new PrismaClient();

// Forgot Password Controller
export const forgotPassword = async (req: Request, res: Response) => {
  // Extremely detailed logging for incoming request
  console.log('Forgot Password Request FULL DETAILS:', {
    body: JSON.stringify(req.body),
    headers: JSON.stringify(req.headers),
    method: req.method,
    contentType: req.headers['content-type'],
    query: JSON.stringify(req.query)
  });

  // Log request body parsing
  console.log('Request Body Type:', typeof req.body);
  console.log('Request Body Keys:', req.body ? Object.keys(req.body) : 'NO BODY');

  try {
    // Type-safe email extraction
    const email = req.body && typeof req.body === 'object' && 'email' in req.body 
      ? String(req.body.email).trim() 
      : undefined;

    // Validate email input with multiple checks
    if (!email) {
      console.warn('Forgot password attempt with INVALID email:', {
        bodyType: typeof req.body,
        bodyKeys: req.body ? Object.keys(req.body) : 'NO BODY',
        email: email
      });
      return res.status(400).json({ 
        error: 'Email is required',
        details: 'Please provide a valid email address',
        debugInfo: {
          bodyType: typeof req.body,
          bodyKeys: req.body ? Object.keys(req.body) : 'NO BODY'
        }
      });
    }

    // Validate email format
    if (!isEmail(email)) {
      console.warn('Invalid email format', { email });
      return res.status(400).json({ 
        error: 'Invalid email format',
        details: 'Please provide a valid email address' 
      });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({ 
      where: { email },
      select: { id: true, email: true } 
    });

    // Detailed logging for user lookup
    console.log('User Lookup Result:', {
      email,
      userFound: !!user
    });

    if (!user) {
      return res.status(404).json({ 
        error: 'Account not found',
        details: 'No account is associated with this email address' 
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Update user with reset token
    try {
      await prisma.user.update({
        where: { email },
        data: {
          resetToken,
          resetTokenExpiry
        }
      });
    } catch (updateError) {
      console.error('Failed to update reset token:', {
        email,
        error: updateError instanceof Error ? updateError.message : String(updateError)
      });
      return res.status(500).json({ 
        error: 'Token generation failed',
        details: 'Unable to generate password reset token' 
      });
    }

    // Prepare reset URL
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;

    // Send reset email
    try {
      // Check if email sending is in fallback mode
      if (emailSendingFallback) {
        console.warn('Email sending in fallback mode. Cannot send password reset email.');
        return res.status(500).json({ 
          error: 'Email service temporarily unavailable',
          details: 'Please try again later or contact support'
        });
      }

      // Validate email configuration and transporter
      if (!transporter) {
        console.error('SMTP transporter not initialized');
        return res.status(500).json({ 
          error: 'Email service not available',
          details: 'SMTP transporter failed to initialize',
          debugInfo: {
            smtpHost: 'smtp.gmail.com',
            smtpUser: process.env.EMAIL_USER ? 'CONFIGURED' : 'NOT SET'
          }
        });
      }

      // Validate email configuration
      if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.error('SMTP credentials not configured');
        return res.status(500).json({ 
          error: 'Email service not configured',
          details: 'SMTP credentials are missing' 
        });
      }

      // Attempt to send email with detailed logging
      const emailResult = await new Promise<nodemailer.SentMessageInfo>((resolve, reject) => {
        transporter.sendMail({
          from: process.env.EMAIL_USER || 'noreply@example.com',
          to: email,
          subject: 'Password Reset Request',
          html: `
            <h2>Password Reset</h2>
            <p>You have requested a password reset. Click the link below to reset your password:</p>
            <a href="${resetUrl}">Reset Password</a>
            <p>This link will expire in 1 hour.</p>
          `
        }, (err, info) => {
          if (err) reject(err);
          else resolve(info);
        });
      });

      console.log('Password reset email sent', { 
        email, 
        resetUrl, 
        messageId: emailResult.messageId 
      });

      res.json({ 
        message: 'Password reset link sent to your email',
        details: 'Check your inbox for further instructions' 
      });
    } catch (emailError) {
      // Comprehensive error logging for email sending failures
      const errorDetails = emailError instanceof Error 
        ? {
            name: emailError.name,
            message: emailError.message,
            stack: emailError.stack
          } 
        : { message: String(emailError) };

      console.error('Failed to send reset email:', {
        email,
        smtpConfig: {
          host: process.env.SMTP_HOST || 'NOT SET',
          port: process.env.SMTP_PORT || 'NOT SET',
          user: process.env.SMTP_USER ? 'CONFIGURED' : 'NOT SET'
        },
        error: errorDetails
      });

      return res.status(500).json({ 
        error: 'Email sending failed',
        details: 'Unable to send password reset email',
        debugInfo: {
          smtpConfigured: !!process.env.SMTP_USER,
          errorType: errorDetails.name,
          errorMessage: errorDetails.message
        }
      });
    }
  } catch (error) {
    // Comprehensive error logging
    const errorDetails = error instanceof Error 
      ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        } 
      : { message: String(error) };

    console.error('Unexpected forgot password error:', {
      input: { email: req.body.email },
      error: errorDetails
    });

    res.status(500).json({ 
      error: 'Internal server error', 
      details: 'An unexpected error occurred while processing your request',
      errorInfo: errorDetails 
    });
  }
};

// Reset Password Controller is now handled by the async function above

export const addUser = async (req: Request, res: Response) => {
  try {
    // Log incoming request
    console.log('Incoming registration request:', JSON.stringify(req.body, null, 2));
    
    const { name, full_name, number, email, password, bank_account_number, role } = req.body;

    // Log field validation
    console.log('Validating required fields...');
    
    // Validate required fields
    if (!name || !full_name || !number || !email || !password || !bank_account_number || !role) {
      console.log('Missing required fields:', {
        name: !name,
        full_name: !full_name,
        number: !number,
        email: !email,
        password: !password,
        bank_account_number: !bank_account_number,
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
        }
      });
    }

    // Validate number is a valid numeric value
// Validate phone number format
const phoneRegex = /^[0-9]{8,15}$/;
if (!phoneRegex.test(number)) {
  console.log('Registration failed: Invalid phone number', { providedNumber: number });
  return res.status(400).json({
    status: 'error',
    message: 'Invalid phone number',
    errors: {
      number: 'Phone number must be 8-15 digits long. No spaces or special characters allowed.'
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

    // Check if the role is valid
    const allowedRoles = ['user', 'admin']; // Example roles
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    // Proceed with user creation
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
    const { id } = req.params;
    const { email, password, role, img, name, full_name, number } = req.body;

    const updateData: any = {
      email,
      role,
    };
    if (typeof name !== 'undefined') updateData.name = name;
    if (typeof full_name !== 'undefined') updateData.full_name = full_name;
    if (typeof number !== 'undefined') updateData.number = number;
    if (typeof img !== 'undefined') updateData.img = img;
    if (password) updateData.password = await bcrypt.hash(password, 10);

    const user = await prisma.user.update({
      where: { id: Number(id) },
      data: updateData
    });

    return res.status(200).json({
      message: 'User updated successfully',
      user
    });
  } catch (err: any) {
    console.error('Error updating user:', err);
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
    } catch (jwtError: unknown) {
      if (jwtError instanceof Error && jwtError.name === 'JsonWebTokenError') {
        return res.status(400).json({ error: 'Invalid token' });
      }
      console.error('JWT token generation error:', {
        message: jwtError instanceof Error ? jwtError.message : String(jwtError),
        stack: jwtError instanceof Error ? jwtError.stack : 'No stack trace'
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
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { 
        id: number;
        resetToken: string;
        resetTokenExpiry: number;
      };

      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
      });

      if (!user || !user.resetToken || !user.resetTokenExpiry) {
        return res.status(400).json({ error: 'Invalid or expired token' });
      }

      if (user.resetToken !== decoded.resetToken) {
        return res.status(400).json({ error: 'Invalid token' });
      }

      if (user.resetTokenExpiry < Date.now()) {
        return res.status(400).json({ error: 'Token has expired' });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          resetToken: null,
          resetTokenExpiry: null,
        },
      });

      return res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        return res.status(400).json({ error: 'Invalid token' });
      }
      return res.status(500).json({ error: 'Internal server error' });
    }
  } catch (error) {
    console.error('Error resetting password:', error);
    return res.status(500).json({ error: 'Internal server error' });
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
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existingUser = await prisma.user.findUnique({ where: { id: Number(id) } });

    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    await prisma.user.delete({
      where: { id: Number(id) }
    });

    return res.status(200).json({ message: 'User deleted successfully' });
  } catch (err: any) {
    console.error('Error deleting user:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  const userId = parseInt(req.params.id);
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current and new passwords are required.' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return res.status(200).json({ message: 'Password changed successfully.' });
  } catch (error) {
    console.error('Error changing password:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};
export const createUser = async (req: Request, res: Response) => {
  try {
    const {
      name,
      full_name,
      number,
      email,
      password,
      bank_account_number,
      role
    } = req.body;

    // Validate required fields
    if (
      !name || !full_name || !number || !email || !password ||
      !bank_account_number || !role
    ) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        name,
        full_name,
        number,
        email,
        password: hashedPassword,
        bank_account_number,
        role
      }
    });

    res.status(201).json({ message: 'User created successfully', user: newUser });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

//updated agents 
export const updateAgent = async (req: Request, res: Response) => {
  const agentId = Number(req.params.id);
  const { region_id } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({ where: { id: agentId } });

    if (!existingUser || existingUser.role !== 'agent') {
      return res.status(404).json({ message: 'Agent not found' });
    }

    const updatedAgent = await prisma.user.update({
      where: { id: agentId },
      data: { region_id }
    });

    res.status(200).json(updatedAgent);
  } catch (error) {
    console.error('Error updating agent:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAgents = async (req: Request, res: Response) => {
  try {
    // Fetch users with the role 'agent'
    const users = await prisma.user.findMany({
      where: { role: 'agent' },
      select: {
        id: true,
        name: true,
        full_name: true,
        number: true,
        email: true,
        bank_account_number: true,
        role: true,
      },
    });

    if (!users || users.length === 0) {
      return res.status(404).json({ message: 'No agents found' });
    }

    return res.json(users);
  } catch (err: any) {
    console.error('Error fetching users with role "agent":', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};






export const getUsersByRole = async (req: Request, res: Response, role: Prisma.UserRoleFilter) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        role
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return res.json(users);
  } catch (error: any) {
    console.error('Error in getUsersByRole:', error);
    return res.status(500).json({ error: error.message });
  }
};