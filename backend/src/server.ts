import express from 'express';
import path from 'path';
import { router as reclamRoutes } from './routes/reclamRoutes';
import uploadRoutes from './routes/uploadRoutes';
import bancRoutes from './routes/bancRoutes';

const app = express();

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Other middleware and routes
app.use(express.json());
app.use('/api/reclams', reclamRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/banc', bancRoutes);

// ...rest of your server setup (error handlers, listen, etc.)

export default app;
