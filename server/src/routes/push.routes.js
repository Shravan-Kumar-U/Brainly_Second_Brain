import { Router } from 'express';

import * as pushController from '../controllers/push.controller.js';
import { protect } from '../middleware/auth.js';
import { actionLimiter, pushLimiter } from '../middleware/rateLimiter.js';
import { validate } from '../middleware/validate.js';
import {
  actionSchema,
  subscribeSchema,
  unsubscribeSchema,
} from '../validators/push.validator.js';

const router = Router();

// Public: the signed token in the body is the credential
router.get('/public-key', pushController.getPublicKey);
router.post('/action', actionLimiter, validate(actionSchema), pushController.runAction);

router.post('/subscriptions', protect, pushLimiter, validate(subscribeSchema), pushController.subscribe);
router.post('/unsubscribe', protect, validate(unsubscribeSchema), pushController.unsubscribe);
router.post('/test', protect, pushLimiter, pushController.sendTest);

export default router;