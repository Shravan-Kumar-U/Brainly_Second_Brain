import { Router } from 'express';

import * as collectionController from '../controllers/collection.controller.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { ApiError } from '../utils/ApiError.js';
import {
  createCollectionSchema,
  updateCollectionSchema,
} from '../validators/collection.validator.js';

const router = Router();

router.use(protect);

router.param('id', (req, res, next, id) => {
  if (!/^[a-f\d]{24}$/i.test(id)) return next(new ApiError(400, 'Invalid collection id'));
  next();
});

router
  .route('/')
  .get(collectionController.listCollections)
  .post(validate(createCollectionSchema), collectionController.createCollection);

router
  .route('/:id')
  .patch(validate(updateCollectionSchema), collectionController.updateCollection)
  .delete(collectionController.deleteCollection);

router
  .route('/:id/share')
  .post(collectionController.enableShare)
  .delete(collectionController.disableShare);

router.post('/:id/share/regenerate', collectionController.regenerateShare);

export default router;