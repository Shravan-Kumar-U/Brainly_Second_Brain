import dotenv from 'dotenv';

dotenv.config();

const required = [
  'MONGODB_URI',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'VAPID_PUBLIC_KEY',
  'VAPID_PRIVATE_KEY',
  'VAPID_SUBJECT',
];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

for (const key of ['JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET']) {
  if (process.env[key].length < 32) {
    throw new Error(`${key} must be at least 32 characters`);
  }
}

if (!/^(mailto:|https:\/\/)/.test(process.env.VAPID_SUBJECT)) {
  throw new Error('VAPID_SUBJECT must start with mailto: or https://');
}

// CLIENT_URL may hold several origins separated by commas. Trailing slashes are
// removed because browsers send origins without one, and a mismatch breaks CORS.
const clientOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim().replace(/\/+$/, ''))
  .filter(Boolean);

export const env = Object.freeze({
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGODB_URI,
  clientOrigins: Object.freeze(clientOrigins),
  youtubeApiKey: process.env.YOUTUBE_API_KEY || null,
  jwt: Object.freeze({
    accessSecret: process.env.JWT_ACCESS_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    // Signs notification action tokens (refresh tokens themselves are random strings)
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    refreshExpiresDays: Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS) || 30,
  }),
  vapid: Object.freeze({
    publicKey: process.env.VAPID_PUBLIC_KEY,
    privateKey: process.env.VAPID_PRIVATE_KEY,
    subject: process.env.VAPID_SUBJECT,
  }),
});