const PLATFORM_RULES = [
  { platform: 'facebook', domains: ['fb.watch'], contentType: 'video' },
  { platform: 'youtube', domains: ['youtube.com', 'youtu.be'], contentType: 'video' },
  {
    platform: 'instagram',
    domains: ['instagram.com', 'instagr.am'],
    contentType: 'image',
    videoPath: /^\/(reels?|tv)\//,
  },
  {
    platform: 'facebook',
    domains: ['facebook.com', 'fb.com'],
    contentType: 'post',
    videoPath: /\/(reel|watch|videos?)(\/|$)/,
  },
  { platform: 'twitter', domains: ['twitter.com', 'x.com', 't.co'], contentType: 'post' },
  { platform: 'github', domains: ['github.com'], contentType: 'repo' },
  { platform: 'linkedin', domains: ['linkedin.com'], contentType: 'post' },
  { platform: 'reddit', domains: ['reddit.com', 'redd.it'], contentType: 'post' },
  { platform: 'tiktok', domains: ['tiktok.com'], contentType: 'video' },
  { platform: 'medium', domains: ['medium.com'], contentType: 'article' },
];

// Query params that never change which page you land on
const TRACKING_PARAMS = new Set([
  'fbclid', 'igshid', 'igsh', 'gclid', 'si', 'feature',
  'ref', 'ref_src', 'ref_url', 's', 't', 'mc_cid', 'mc_eid',
]);

export const detectPlatform = (rawUrl) => {
  const { hostname, pathname } = new URL(rawUrl);
  const host = hostname.toLowerCase();

  const rule = PLATFORM_RULES.find(({ domains }) =>
    domains.some((d) => host === d || host.endsWith(`.${d}`))
  );

  if (!rule) return { platform: 'other', contentType: 'article' };

  const isVideo = rule.videoPath?.test(pathname);
  return {
    platform: rule.platform,
    contentType: isVideo ? 'video' : rule.contentType,
  };
};

// Used ONLY for duplicate detection. The original URL is what we store and open.
export const normalizeUrl = (rawUrl) => {
  const url = new URL(rawUrl);

  let host = url.hostname.toLowerCase().replace(/^www\./, '');
  let pathname = url.pathname;
  const params = new URLSearchParams(url.search);

  if (host === 'youtu.be') {
    params.set('v', pathname.slice(1).split('/')[0]);
    pathname = '/watch';
    host = 'youtube.com';
  }
  if (host.endsWith('youtube.com')) host = 'youtube.com'; // m., music.
  if (host === 'x.com' || host === 'mobile.twitter.com') host = 'twitter.com';

  for (const key of [...params.keys()]) {
    if (key.startsWith('utm_') || TRACKING_PARAMS.has(key)) params.delete(key);
  }
  params.sort();

  pathname = pathname.replace(/\/+$/, '') || '/';
  const query = params.toString();

  return `${host}${pathname}${query ? `?${query}` : ''}`;
};