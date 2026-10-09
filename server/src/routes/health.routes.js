import { Router } from 'express';
import mongoose from 'mongoose';

const router = Router();

router.get('/', (req, res) => {
  const dbStates = ['disconnected', 'connected', 'connecting', 'disconnecting'];

  res.json({
    success: true,
    service: 'brainly-api',
    uptime: Math.round(process.uptime()),
    database: dbStates[mongoose.connection.readyState],
    timestamp: new Date().toISOString(),
  });
});

export default router;