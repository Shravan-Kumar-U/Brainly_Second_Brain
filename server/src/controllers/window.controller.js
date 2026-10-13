import * as windowService from '../services/window.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listWindows = asyncHandler(async (req, res) => {
  const windows = await windowService.listWindows(req.user._id);
  res.json({ success: true, data: { windows } });
});

export const createWindow = asyncHandler(async (req, res) => {
  const window = await windowService.createWindow(req.user._id, req.body);
  res.status(201).json({ success: true, data: { window } });
});

export const updateWindow = asyncHandler(async (req, res) => {
  const window = await windowService.updateWindow(req.user._id, req.params.id, req.body);
  res.json({ success: true, data: { window } });
});

export const deleteWindow = asyncHandler(async (req, res) => {
  await windowService.deleteWindow(req.user._id, req.params.id);
  res.json({ success: true, message: 'Watch window deleted' });
});

export const suggest = asyncHandler(async (req, res) => {
  const result = await windowService.suggest(req.user, req.validated.query);
  res.json({ success: true, data: result });
});