import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import * as tokenService from './token.service.js';

export const register = async ({ name, email, password, timezone }, meta) => {
  const existing = await User.findOne({ email });
  if (existing) {
    throw new ApiError(409, 'An account with this email already exists');
  }

  const user = await User.create({ name, email, password, timezone });
  const tokens = await tokenService.issueTokenPair(user, meta);

  return { user, tokens };
};

export const login = async ({ email, password }, meta) => {
  const user = await User.findOne({ email }).select('+password');

  // Same message for "no such user" and "wrong password" so attackers
  // can't discover which emails are registered
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const tokens = await tokenService.issueTokenPair(user, meta);

  return { user, tokens };
};

export const refresh = async (refreshToken, meta) => {
  const user = await tokenService.consumeRefreshToken(refreshToken);
  const tokens = await tokenService.issueTokenPair(user, meta);

  return { user, tokens };
};

export const logout = async (refreshToken) => {
  await tokenService.revokeRefreshToken(refreshToken);
};