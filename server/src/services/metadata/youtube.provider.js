import { env } from '../../config/env.js';
import { extractYouTubeId } from '../../utils/url.util.js';

const TIMEOUT_MS = 5000;

const getJson = async (url) => {
  const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!res.ok) throw new Error(`YouTube responded with ${res.status}`);
  return res.json();
};

// "PT1H2M3S" → minutes, rounded up. Live/upcoming videos ("P0D") → null.
export const parseIsoDuration = (iso) => {
  const match = /^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/.exec(iso ?? '');
  if (!match) return null;

  const [, days, hours, minutes, seconds] = match;
  const totalSeconds =
    Number(days ?? 0) * 86400 +
    Number(hours ?? 0) * 3600 +
    Number(minutes ?? 0) * 60 +
    Number(seconds ?? 0);

  if (totalSeconds === 0) return null;
  return Math.min(600, Math.max(1, Math.ceil(totalSeconds / 60)));
};

const fromDataApi = async (videoId) => {
  const endpoint = new URL('https://www.googleapis.com/youtube/v3/videos');
  endpoint.search = new URLSearchParams({
    part: 'snippet,contentDetails',
    id: videoId,
    key: env.youtubeApiKey,
  }).toString();

  const data = await getJson(endpoint);
  const video = data.items?.[0];
  if (!video) return null;

  const { snippet, contentDetails } = video;
  const thumbs = snippet.thumbnails ?? {};
  const best = thumbs.maxres ?? thumbs.standard ?? thumbs.high ?? thumbs.medium ?? thumbs.default;

  return {
    title: snippet.title,
    description: snippet.description,
    thumbnail: best?.url ?? null,
    author: snippet.channelTitle,
    durationMinutes: parseIsoDuration(contentDetails?.duration),
  };
};

const fromOEmbed = async (videoId) => {
  const endpoint = new URL('https://www.youtube.com/oembed');
  endpoint.search = new URLSearchParams({
    url: `https://www.youtube.com/watch?v=${videoId}`,
    format: 'json',
  }).toString();

  const data = await getJson(endpoint);
  return {
    title: data.title,
    description: '',
    thumbnail: data.thumbnail_url ?? null,
    author: data.author_name,
    durationMinutes: null, // oEmbed does not expose duration
  };
};

export const fetchYouTubeMetadata = async (url) => {
  const videoId = extractYouTubeId(url);
  if (!videoId) return null; // channel / playlist pages fall back to Open Graph

  if (env.youtubeApiKey) {
    try {
      const video = await fromDataApi(videoId);
      if (video) return video;
    } catch (error) {
      console.warn(`[metadata] YouTube API failed: ${error.message}`);
    }
  }

  return fromOEmbed(videoId);
};