import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';

import { env } from '../config/env.js';
import { RefreshToken } from '../models/RefreshToken.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';

const DAY_MS = 24 * 60 * 60 * 1000;

const hashToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex');

export const signAccessToken = (userId) =>
  jwt.sign({ sub: String(userId) }, env.jwt.accessSecret, {
    expiresIn: env.jwt.accessExpiresIn,
  });

export const verifyAccessToken = (token) =>
  jwt.verify(token, env.jwt.accessSecret);

const createRefreshToken = async (userId, meta = {}) => {
  const token = crypto.randomBytes(48).toString('hex');

  await RefreshToken.create({
    user: userId,
    tokenHash: hashToken(token),
    expiresAt: new Date(Date.now() + env.jwt.refreshExpiresDays * DAY_MS),
    userAgent: meta.userAgent,
    ip: meta.ip,
  });

  return token; // the raw token is returned once; only its hash is stored
};

export const issueTokenPair = async (user, meta) => ({
  accessToken: signAccessToken(user._id),
  refreshToken: await createRefreshToken(user._id, meta),
});

// Atomically delete the token so it can only ever be used once
export const consumeRefreshToken = async (token) => {
  const record = await RefreshToken.findOneAndDelete({
    tokenHash: hashToken(token),
  });

  if (!record || record.expiresAt < new Date()) {
    throw new ApiError(401, 'Invalid or expired refresh token');
  }

  const user = await User.findById(record.user);
  if (!user) {
    throw new ApiError(401, 'User no longer exists');
  }

  return user;
};

export const revokeRefreshToken = async (token) => {
  const record = await RefreshToken.findOneAndDelete({ tokenHash: hashToken(token) });
  return record?.user ?? null;
};

const ACTION_AUDIENCE = 'item-action';

// A short-lived pass for one item, used by the Done/Snooze buttons inside a notification.
// Signed with a DIFFERENT secret than login tokens, so it can never be used to log in.
export const signActionToken = ({ userId, itemId }) =>
  jwt.sign({ sub: String(userId), item: String(itemId) }, env.jwt.refreshSecret, {
    audience: ACTION_AUDIENCE,
    expiresIn: '24h',
  });

export const verifyActionToken = (token) =>
  jwt.verify(token, env.jwt.refreshSecret, { audience: ACTION_AUDIENCE });