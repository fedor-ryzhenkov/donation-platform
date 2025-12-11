import express from 'express';
import cors from 'cors';
import { initDatabase } from './database';
import {
  influencersRouter,
  campaignsRouter,
  donorsRouter,
  donationsRouter,
  statsRouter,
} from './routers';

import authRoutes from "./routers/auth.routes";




const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/auth", authRoutes);
app.use('/api/influencers', influencersRouter);
app.use('/api/campaigns', campaignsRouter);
app.use('/api/donors', donorsRouter);
app.use('/api/donations', donationsRouter);
app.use('/api/stats', statsRouter);

app.use("/auth", authRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
async function start() {
  await initDatabase();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

start();
