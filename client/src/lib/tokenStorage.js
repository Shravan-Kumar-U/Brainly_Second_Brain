const ACCESS_KEY = 'brainly.accessToken';
const REFRESH_KEY = 'brainly.refreshToken';

const read = (key) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const write = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* storage unavailable: the session just won't survive a reload */
  }
};

const remove = (key) => {
  try {
    localStorage.removeItem(key);
  } catch {
    /* nothing to do */
  }
};

export const tokenStorage = {
  getAccess: () => read(ACCESS_KEY),
  getRefresh: () => read(REFRESH_KEY),
  hasSession: () => Boolean(read(REFRESH_KEY)),
  set: ({ accessToken, refreshToken }) => {
    write(ACCESS_KEY, accessToken);
    write(REFRESH_KEY, refreshToken);
  },
  clear: () => {
    remove(ACCESS_KEY);
    remove(REFRESH_KEY);
  },
};