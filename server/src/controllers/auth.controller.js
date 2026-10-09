import * as authService from '../services/auth.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const getMeta = (req) => ({
  userAgent: req.get('user-agent'),
  ip: req.ip,
});

export const register = asyncHandler(async (req, res) => {
  const { user, tokens } = await authService.register(req.body, getMeta(req));

  res.status(201).json({ success: true, data: { user, ...tokens } });
});

export const login = asyncHandler(async (req, res) => {
  const { user, tokens } = await authService.login(req.body, getMeta(req));

  res.json({ success: true, data: { user, ...tokens } });
});

export const refresh = asyncHandler(async (req, res) => {
  const { user, tokens } = await authService.refresh(
    req.body.refreshToken,
    getMeta(req)
  );

  res.json({ success: true, data: { user, ...tokens } });
});

export const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.body.refreshToken);

  res.json({ success: true, message: 'Logged out' });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { user: req.user } });
});