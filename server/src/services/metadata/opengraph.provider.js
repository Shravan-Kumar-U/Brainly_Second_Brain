import * as cheerio from 'cheerio';
import { fetchHtml } from '../../utils/safeFetch.js';

const WORDS_PER_MINUTE = 200;
const MIN_WORDS_FOR_ESTIMATE = 150;

const firstContent = ($, selectors) => {
  for (const selector of selectors) {
    const value = $(selector).first().attr('content')?.trim();
    if (value) return value;
  }
  return '';
};

// Resolves relative paths and upgrades http → https
// (an http image would be blocked inside an https PWA)
const toHttpsImage = (value, baseUrl) => {
  if (!value) return null;
  try {
    const url = new URL(value, baseUrl);
    if (!['http:', 'https:'].includes(url.protocol)) return null;
    url.protocol = 'https:';
    return url.href;
  } catch {
    return null;
  }
};

const estimateReadingMinutes = ($) => {
  $('script, style, noscript, svg, nav, footer, form').remove();
  const words = $('body').text().split(/\s+/).filter(Boolean).length;
  if (words < MIN_WORDS_FOR_ESTIMATE) return null; // probably a script-rendered page
  return Math.min(600, Math.ceil(words / WORDS_PER_MINUTE));
};

export const fetchOpenGraph = async (url, { estimateReading = false } = {}) => {
  const { html, finalUrl, truncated } = await fetchHtml(url);
  const $ = cheerio.load(html);

  const result = {
    title:
      firstContent($, ['meta[property="og:title"]', 'meta[name="twitter:title"]']) ||
      $('title').first().text(),
    description: firstContent($, [
      'meta[property="og:description"]',
      'meta[name="twitter:description"]',
      'meta[name="description"]',
    ]),
    thumbnail: toHttpsImage(
      firstContent($, [
        'meta[property="og:image"]',
        'meta[property="og:image:url"]',
        'meta[name="twitter:image"]',
        'meta[name="twitter:image:src"]',
      ]),
      finalUrl
    ),
    author: firstContent($, ['meta[name="author"]']),
    durationMinutes: null,
  };

  // Last, because it removes elements from the document.
  // Skipped for truncated pages since the word count would be wrong.
  if (estimateReading && !truncated) {
    result.durationMinutes = estimateReadingMinutes($);
  }

  return result;
};