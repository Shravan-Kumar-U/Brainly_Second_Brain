import * as bulkService from '../services/bulk.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const runBulk = asyncHandler(async (req, res) => {
  const result = await bulkService.runBulk(req.user._id, req.body);
  res.json({ success: true, data: result });
});