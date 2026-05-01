import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

import emailsRouter from './routes/emails';
import draftsRouter from './routes/drafts';
import followupsRouter from './routes/followups';
import analyticsRouter from './routes/analytics';
import triageRouter from './routes/triage';
import { getDatabase } from './db/database';
import { authMiddleware } from './middleware/auth';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

app.use(cors({
  origin: FRONTEND_URL,
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'x-api-key'],
}));
app.use(express.json());

app.use('/api/emails', authMiddleware, emailsRouter);
app.use('/api/drafts', authMiddleware, draftsRouter);
app.use('/api/followups', authMiddleware, followupsRouter);
app.use('/api/analytics', authMiddleware, analyticsRouter);
app.use('/api/triage', authMiddleware, triageRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', mode: process.env.DEMO_MODE === 'true' ? 'demo' : 'production' });
});

app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

async function startServer() {
  try {
    await getDatabase();
    console.log('Database initialized');

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Mode: ${process.env.DEMO_MODE === 'true' ? 'DEMO' : 'PRODUCTION'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;