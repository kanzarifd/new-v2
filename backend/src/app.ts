import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { errorHandler } from './middleware/errorHandler';

// Import routes
import { router as userRoutes } from './routes/userRoutes';
import searchRoutes from './routes/searchRoutes';
import { router as reclamRoutes } from './routes/reclamRoutes';
import { router as regionRoutes } from './routes/regionRoutes';
import uploadRoutes from './routes/uploadRoutes';
import bancRoutes from './routes/bancRoutes'; // ✅ keep only this

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/reclams/search', searchRoutes); // mount before /api/reclams
app.use('/api/reclams', reclamRoutes);
app.use('/api/regions', regionRoutes);
app.use('/api/banc', bancRoutes); // ✅ only once

// Static folder
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Error handling
app.use(errorHandler);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
