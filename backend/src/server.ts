import express from 'express';
import path from 'path';
import { router as reclamRoutes } from './routes/reclamRoutes';
import uploadRoutes from './routes/uploadRoutes';

const app = express();

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Other middleware and routes
app.use(express.json());
app.use('/api/reclams', reclamRoutes);
app.use('/api/upload', uploadRoutes);

// ...rest of your server setup (error handlers, listen, etc.)

export default app;
