import { env } from '../config/env.js';
import * as pushService from '../services/push.service.js';
import * as reminderService from '../services/reminder.service.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getPublicKey = (req, res) => {
  res.json({ success: true, data: { publicKey: env.vapid.publicKey } });
};

export const subscribe = asyncHandler(async (req, res) => {
  await pushService.saveSubscription(req.user._id, req.body, req.get('user-agent'));
  res.status(201).json({ success: true, message: 'Reminders enabled for this device' });
});

export const unsubscribe = asyncHandler(async (req, res) => {
  await pushService.removeSubscription(req.user._id, req.body.endpoint);
  res.json({ success: true, message: 'Reminders disabled for this device' });
});

export const sendTest = asyncHandler(async (req, res) => {
  const devices = await pushService.countDevices(req.user._id);
  if (devices === 0) {
    throw new ApiError(409, 'No device is registered yet. Turn reminders off and on again.');
  }

  pushService.sendTestLater(req.user._id); // arrives in about 5 seconds
  res.json({ success: true, data: { devices } });
});

export const runAction = asyncHandler(async (req, res) => {
  await reminderService.performAction(req.body);
  res.json({ success: true });
});