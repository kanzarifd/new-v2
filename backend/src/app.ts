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

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/users', userRoutes);
// Mount search before dynamic routes to avoid shadowing
app.use('/api/reclams/search', searchRoutes);
app.use('/api/reclams', reclamRoutes);
app.use('/api/regions', regionRoutes);

// Error handling
app.use(errorHandler);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
