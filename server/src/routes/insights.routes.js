import { Router } from 'express';

import * as insightsController from '../controllers/insights.controller.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.get('/', protect, insightsController.getInsights);

export default router;