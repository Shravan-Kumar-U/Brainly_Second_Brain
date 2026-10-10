import { useCallback, useEffect, useMemo, useState } from 'react';

import { ThemeContext } from './theme-context';

const STORAGE_KEY = 'brainly.theme';
const THEMES = ['light', 'dark', 'system'];
const DARK_QUERY = '(prefers-color-scheme: dark)';

const readStoredTheme = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return THEMES.includes(stored) ? stored : 'system';
  } catch {
    return 'system';
  }
};

const applyTheme = (theme) => {
  const dark = theme === 'dark' || (theme === 'system' && window.matchMedia(DARK_QUERY).matches);

  document.documentElement.classList.toggle('dark', dark);
  // Colors the phone's status bar to match the app
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', dark ? '#0b0d14' : '#ffffff');
};

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(readStoredTheme);

  useEffect(() => {
    applyTheme(theme);

    if (theme !== 'system') return undefined;

    // In "system" mode, follow the OS when it switches between light and dark
    const media = window.matchMedia(DARK_QUERY);
    const onChange = () => applyTheme('system');
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [theme]);

  const setTheme = useCallback((next) => {
    setThemeState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* storage unavailable: the choice just won't persist */
    }
  }, []);

  const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}