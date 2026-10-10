import { Router } from 'express';

import * as itemController from '../controllers/item.controller.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { ApiError } from '../utils/ApiError.js';
import {
  createItemSchema,
  listItemsQuerySchema,
  snoozeSchema,
  updateItemSchema,
} from '../validators/item.validator.js';

const router = Router();

// Every route in this file requires a logged-in user
router.use(protect);

// Runs automatically for any route containing :id
router.param('id', (req, res, next, id) => {
  if (!/^[a-f\d]{24}$/i.test(id)) return next(new ApiError(400, 'Invalid item id'));
  next();
});

router
  .route('/')
  .post(validate(createItemSchema), itemController.createItem)
  .get(validate(listItemsQuerySchema, 'query'), itemController.listItems);

// Must be declared BEFORE '/:id', otherwise "tags" would be treated as an id
router.get('/tags', itemController.listTags);

router
  .route('/:id')
  .get(itemController.getItem)
  .patch(validate(updateItemSchema), itemController.updateItem)
  .delete(itemController.deleteItem);

router.post('/:id/complete', itemController.completeItem);
router.post('/:id/snooze', validate(snoozeSchema), itemController.snoozeItem);
router.post('/:id/archive', itemController.archiveItem);
router.post('/:id/restore', itemController.restoreItem);

export default router;