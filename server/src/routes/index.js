import { Router } from 'express';
import healthRoutes from './health.routes.js';
import authRoutes from './auth.routes.js';
import itemRoutes from './item.routes.js';
import insightsRoutes from './insights.routes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/items', itemRoutes);
router.use('/insights', insightsRoutes);

export default router;