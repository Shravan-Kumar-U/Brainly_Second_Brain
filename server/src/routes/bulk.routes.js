import { Router } from 'express';

import * as bulkController from '../controllers/bulk.controller.js';
import { protect } from '../middleware/auth.js';
import { bulkLimiter } from '../middleware/rateLimiter.js';
import { validate } from '../middleware/validate.js';
import { bulkSchema } from '../validators/bulk.validator.js';

const router = Router();

router.post('/', protect, bulkLimiter, validate(bulkSchema), bulkController.runBulk);

export default router;