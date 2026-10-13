import { Router } from 'express';

import * as preferencesController from '../controllers/preferences.controller.js';
import { protect } from '../middleware/auth.js';
import { pushLimiter } from '../middleware/rateLimiter.js';
import { validate } from '../middleware/validate.js';
import { updatePreferencesSchema } from '../validators/preferences.validator.js';

const router = Router();

router.use(protect);

router
  .route('/')
  .get(preferencesController.getPreferences)
  .patch(validate(updatePreferencesSchema), preferencesController.updatePreferences);

router.post('/weekly-review/preview', pushLimiter, preferencesController.previewWeeklyReview);

export default router;