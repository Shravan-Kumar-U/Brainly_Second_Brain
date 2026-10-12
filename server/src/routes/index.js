import { Router } from 'express';
import healthRoutes from './health.routes.js';
import authRoutes from './auth.routes.js';
import itemRoutes from './item.routes.js';
import insightsRoutes from './insights.routes.js';
import pushRoutes from './push.routes.js';
import collectionRoutes from './collection.routes.js';
import sharedRoutes from './shared.routes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/items', itemRoutes);
router.use('/insights', insightsRoutes);
router.use('/push', pushRoutes);
router.use('/collections', collectionRoutes);
router.use('/shared', sharedRoutes);

export default router;