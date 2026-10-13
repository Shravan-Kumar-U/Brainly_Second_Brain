import * as preferencesService from '../services/preferences.service.js';
import * as pushService from '../services/push.service.js';
import * as weeklyReviewService from '../services/weeklyReview.service.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getPreferences = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { preferences: preferencesService.toPreferences(req.user) } });
});

export const updatePreferences = asyncHandler(async (req, res) => {
  const user = await preferencesService.update(req.user._id, req.body);
  res.json({ success: true, data: { preferences: preferencesService.toPreferences(user) } });
});

export const previewWeeklyReview = asyncHandler(async (req, res) => {
  const devices = await pushService.countDevices(req.user._id);
  if (devices === 0) {
    throw new ApiError(409, 'Turn on reminders on this device first.');
  }

  weeklyReviewService.sendPreviewLater(req.user);
  res.json({ success: true, data: { devices } });
});