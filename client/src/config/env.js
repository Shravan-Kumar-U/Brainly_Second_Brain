const apiUrl = import.meta.env.VITE_API_URL;

if (!apiUrl) {
  throw new Error('Missing VITE_API_URL. Create client/.env (see .env.example).');
}

export const env = Object.freeze({
  apiUrl: apiUrl.replace(/\/+$/, ''),
  isDev: import.meta.env.DEV,
});