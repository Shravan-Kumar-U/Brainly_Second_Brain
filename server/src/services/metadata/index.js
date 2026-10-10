import { isUnsafeUrlError } from '../../utils/ssrf.util.js';
import { detectPlatform } from '../../utils/url.util.js';
import { fetchOpenGraph } from './opengraph.provider.js';
import { fetchYouTubeMetadata } from './youtube.provider.js';

const EMPTY = Object.freeze({
  title: '',
  description: '',
  thumbnail: null,
  durationMinutes: null,
  author: '',
});

const clip = (text, max) => (text ?? '').replace(/\s+/g, ' ').trim().slice(0, max);

// Make provider output fit the Item schema limits
const normalize = (raw) => ({
  title: clip(raw.title, 200),
  description: clip(raw.description, 1000),
  thumbnail: raw.thumbnail && raw.thumbnail.length <= 2048 ? raw.thumbnail : null,
  durationMinutes: raw.durationMinutes ?? null,
  author: clip(raw.author, 120),
});

// Ordinary failures (timeouts, 404s) are logged and ignored,
// but security blocks are rethrown so callers can react to them.
const attempt = async (label, provider) => {
  try {
    return await provider();
  } catch (error) {
    if (isUnsafeUrlError(error)) throw error;
    console.warn(`[metadata] ${label} failed: ${error.cause?.message ?? error.message}`);
    return null;
  }
};

export const fetchMetadata = async (url) => {
  const { platform, contentType } = detectPlatform(url);

  if (platform === 'youtube') {
    const video = await attempt('youtube', () => fetchYouTubeMetadata(url));
    if (video?.title) return normalize(video);
  }

  const page = await attempt('opengraph', () =>
    fetchOpenGraph(url, { estimateReading: contentType === 'article' })
  );

  return normalize(page ?? EMPTY);
};