import { Agent, fetch } from 'undici';
import { assertSafeUrl, safeLookup, UnsafeUrlError } from './ssrf.util.js';

const TIMEOUT_MS = 8000;
const MAX_BYTES = 512 * 1024;
const MAX_REDIRECTS = 3;
const REDIRECT_CODES = new Set([301, 302, 303, 307, 308]);

// Every connection made through this agent goes through our DNS guard
const agent = new Agent({ connect: { lookup: safeLookup, timeout: 5000 } });

const readLimited = async (body, maxBytes) => {
  const chunks = [];
  let received = 0;
  let truncated = false;

  for await (const chunk of body) {
    const remaining = maxBytes - received;
    if (chunk.length > remaining) {
      chunks.push(chunk.subarray(0, remaining));
      truncated = true;
      break; // leaving the loop cancels the download
    }
    chunks.push(chunk);
    received += chunk.length;
  }

  return { buffer: Buffer.concat(chunks), truncated };
};

const decode = (buffer, contentType) => {
  const charset = /charset=["']?([\w-]+)/i.exec(contentType)?.[1];
  try {
    return new TextDecoder(charset ?? 'utf-8').decode(buffer);
  } catch {
    return new TextDecoder('utf-8').decode(buffer);
  }
};

export const fetchHtml = async (rawUrl) => {
  const signal = AbortSignal.timeout(TIMEOUT_MS); // one deadline for the whole chain

  let current;
  try {
    current = new URL(rawUrl);
  } catch {
    throw new UnsafeUrlError('Invalid URL');
  }

  for (let hop = 0; hop <= MAX_REDIRECTS; hop += 1) {
    assertSafeUrl(current);

    const res = await fetch(current, {
      dispatcher: agent,
      redirect: 'manual', // we follow redirects ourselves so each hop is re-checked
      signal,
      headers: {
        'user-agent': 'Mozilla/5.0 (compatible; BrainlyBot/1.0)',
        accept: 'text/html,application/xhtml+xml',
        'accept-language': 'en',
      },
    });

    if (REDIRECT_CODES.has(res.status)) {
      const location = res.headers.get('location');
      await res.body?.cancel();
      if (!location) throw new Error('Redirect without a location');
      current = new URL(location, current);
      continue;
    }

    if (!res.ok) {
      await res.body?.cancel();
      throw new Error(`Page responded with ${res.status}`);
    }

    const contentType = res.headers.get('content-type') ?? '';
    if (!/text\/html|application\/xhtml\+xml/i.test(contentType) || !res.body) {
      await res.body?.cancel();
      throw new Error('Not an HTML page');
    }

    const { buffer, truncated } = await readLimited(res.body, MAX_BYTES);
    return { html: decode(buffer, contentType), finalUrl: current.href, truncated };
  }

  throw new Error('Too many redirects');
};