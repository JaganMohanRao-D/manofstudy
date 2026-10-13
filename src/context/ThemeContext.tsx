import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  isDarkMode: boolean;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const THEME_STORAGE_KEYS = ['mos_theme', 'javisak_theme', 'studymacha_theme'] as const;
const THEME_MIGRATION_KEY = 'naa_college_theme_migrated_v1';

function readInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light';

  try {
    // Older releases forcibly stored "dark" on every visit. Ignore those legacy
    // values once, so the bright redesign becomes the new default. After this
    // migration, any future explicit preference is retained across visits.
    if (window.localStorage.getItem(THEME_MIGRATION_KEY) === '1') {
      const savedTheme = THEME_STORAGE_KEYS
        .map((key) => window.localStorage.getItem(key))
        .find((value) => value === 'light' || value === 'dark');

      if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme;
    }
  } catch {
    // Storage can be blocked by browser privacy settings; use the bright default.
  }

  return 'light';
}

function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  root.classList.toggle('dark', theme === 'dark');
  root.classList.toggle('light', theme === 'light');
  root.setAttribute('data-theme', theme);
  root.style.colorScheme = theme;

  try {
    THEME_STORAGE_KEYS.forEach((key) => window.localStorage.setItem(key, theme));
    window.localStorage.setItem(THEME_MIGRATION_KEY, '1');
  } catch {
    // Theme still applies for this page load if persistence is unavailable.
  }
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  isDarkMode: false,
  toggleTheme: () => {},
  setTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(readInitialTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const setTheme = (nextTheme: Theme) => setThemeState(nextTheme);
  const toggleTheme = () => setThemeState((currentTheme) => currentTheme === 'dark' ? 'light' : 'dark');

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode: theme === 'dark', toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
