import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase, db } from './db.js';

import authRoutes from './routes/auth.js';
import plansRoutes from './routes/plans.js';
import marketRoutes from './routes/market.js';
import learningRoutes from './routes/learning.js';
import goalsRoutes from './routes/goals.js';
import scamCheckRoutes from './routes/scamCheck.js';
import aiCoachRoutes from './routes/aiCoach.js';
import premiumRoutes from './routes/premium.js';
import adminRoutes from './routes/admin.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Parsing Middleware
app.use(cors());
app.use(express.json());

// Request logging & Audit trail
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.method !== 'GET' && res.statusCode < 400) {
      try {
        db.prepare('INSERT INTO audit_logs (event_type, details) VALUES (?, ?)').run(
          `${req.method} ${req.path}`,
          `Status: ${res.statusCode}, Duration: ${duration}ms`
        );
      } catch (e) {
        // Non-blocking log catch
      }
    }
  });
  next();
});

// Initialize SQLite Schema & Seed demo accounts
initDatabase();

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/plans', plansRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/learning', learningRoutes);
app.use('/api/goals', goalsRoutes);
app.use('/api/scam-check', scamCheckRoutes);
app.use('/api/ai-coach', aiCoachRoutes);
app.use('/api/premium', premiumRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    platform: 'SaveWise AI',
    version: '1.0.0',
    jurisdiction: 'India (INR)',
    serverTime: new Date().toISOString()
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    error: 'An unexpected internal error occurred. Please try again.',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 SaveWise AI Backend Engine running on http://localhost:${PORT}`);
});
