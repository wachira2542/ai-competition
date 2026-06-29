import express from 'express';
import cors from 'cors';
import { runMigrations } from './db/migrations';
import projectsRouter from './routes/projects';
import evaluationsRouter from './routes/evaluations';
import authRouter from './routes/auth';
import adminRouter from './routes/admin';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// Boot: run DB migrations then start server
runMigrations().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 AAPICO Judge API running at http://localhost:${PORT}`);
  });
}).catch((err: Error) => {
  console.error('❌ Failed to initialize database:', err);
  process.exit(1);
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/evaluations', evaluationsRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'AAPICO Judge API is running 🚀' });
});

// Global error handler
app.use(errorHandler);

export default app;
