import { Router } from 'express';

import * as windowController from '../controllers/window.controller.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { ApiError } from '../utils/ApiError.js';
import {
  createWindowSchema,
  suggestQuerySchema,
  updateWindowSchema,
} from '../validators/window.validator.js';

const router = Router();

router.use(protect);

router.param('id', (req, res, next, id) => {
  if (!/^[a-f\d]{24}$/i.test(id)) return next(new ApiError(400, 'Invalid watch window id'));
  next();
});

// Fixed path first, so "suggest" is never mistaken for an id
router.get('/suggest', validate(suggestQuerySchema, 'query'), windowController.suggest);

router
  .route('/')
  .get(windowController.listWindows)
  .post(validate(createWindowSchema), windowController.createWindow);

router
  .route('/:id')
  .patch(validate(updateWindowSchema), windowController.updateWindow)
  .delete(windowController.deleteWindow);

export default router;