import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  isDarkMode: boolean;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  isDarkMode: false,
  toggleTheme: () => {},
  setTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('light');

  const applyLightTheme = () => {
    const root = document.documentElement;
    root.classList.remove('dark');
    root.classList.add('light');
    root.setAttribute('data-theme', 'light');
    root.style.colorScheme = 'light';
    document.body?.classList.remove('mos-dark-only');
    document.body?.classList.add('mos-regional-light');
    try {
      localStorage.setItem('mos_theme', 'light');
      localStorage.setItem('javisak_theme', 'light');
      localStorage.setItem('studymacha_theme', 'light');
    } catch {
      // Storage can be unavailable in private/restricted browsing.
    }
  };

  useEffect(() => {
    applyLightTheme();
  }, []);

  // Naa College is intentionally light-theme-only. Preserve this API for existing
  // consumers, but never allow a component to turn the site dark again.
  const setTheme = (_nextTheme: Theme) => {
    setThemeState('light');
    applyLightTheme();
  };

  const toggleTheme = () => {
    setThemeState('light');
    applyLightTheme();
  };

  return (
    <ThemeContext.Provider value={{ theme: 'light', isDarkMode: false, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
