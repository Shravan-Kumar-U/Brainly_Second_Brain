import { Router } from 'express';

import * as collectionController from '../controllers/collection.controller.js';
import { sharedLimiter } from '../middleware/rateLimiter.js';
import { ApiError } from '../utils/ApiError.js';

const router = Router();

// Anything that can't be a real token is answered the same way as a revoked one
router.param('token', (req, res, next, token) => {
  if (!/^[\w-]{16,64}$/.test(token)) {
    return next(new ApiError(404, 'This link is no longer available'));
  }
  next();
});

router.get('/:token', sharedLimiter, collectionController.getShared);

export default router;