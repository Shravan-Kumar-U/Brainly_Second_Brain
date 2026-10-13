import { Router } from 'express';

import authRoutes from './auth.routes.js';
import bulkRoutes from './bulk.routes.js';
import collectionRoutes from './collection.routes.js';
import exportRoutes from './export.routes.js';
import healthRoutes from './health.routes.js';
import insightsRoutes from './insights.routes.js';
import itemRoutes from './item.routes.js';
import preferencesRoutes from './preferences.routes.js';
import pushRoutes from './push.routes.js';
import sharedRoutes from './shared.routes.js';
import windowsRoutes from './windows.routes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/items/bulk', bulkRoutes); // before '/items', so it is matched first
router.use('/items', itemRoutes);
router.use('/insights', insightsRoutes);
router.use('/push', pushRoutes);
router.use('/collections', collectionRoutes);
router.use('/shared', sharedRoutes);
router.use('/windows', windowsRoutes);
router.use('/preferences', preferencesRoutes);
router.use('/export', exportRoutes);

export default router;