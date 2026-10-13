import { Router } from 'express';

import * as exportController from '../controllers/export.controller.js';
import { protect } from '../middleware/auth.js';
import { exportLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.get('/', protect, exportLimiter, exportController.exportData);

export default router;