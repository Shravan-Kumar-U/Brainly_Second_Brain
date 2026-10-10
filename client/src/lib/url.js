export const isHttpUrl = (value) => {
  try {
    return ['http:', 'https:'].includes(new URL(value).protocol);
  } catch {
    return false;
  }
};

// Lets people paste "youtube.com/watch?v=..." without the https://
export const normalizeInputUrl = (raw) => {
  const text = raw.trim();
  if (/^https?:\/\//i.test(text)) return text;
  if (!/\s/.test(text) && /^[\w-]+(\.[\w-]+)+(\/|\?|#|$)/.test(text)) return `https://${text}`;
  return text;
};

// Android's share menu often puts the link inside a sentence: "Watch this https://..."
export const extractUrl = (text) =>
  (text.match(/https?:\/\/[^\s<>"']+/i)?.[0] ?? '').replace(/[.,;:!?)]+$/, '');

export const hostnameOf = (value) => {
  try {
    return new URL(value).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
};