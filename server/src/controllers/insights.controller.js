import * as insightsService from '../services/insights.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getInsights = asyncHandler(async (req, res) => {
  const insights = await insightsService.getInsights(req.user);
  res.json({ success: true, data: { insights } });
});