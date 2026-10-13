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

  useEffect(() => {
    const root = document.documentElement;
    // Naa College now defaults to the requested bright theme. Keep the theme
    // context API functional so existing consumers do not break.
    root.classList.remove('dark');
    root.classList.add('light');
    root.setAttribute('data-theme', 'light');
    root.style.colorScheme = 'light';

    try {
      localStorage.setItem('mos_theme', 'light');
      localStorage.setItem('javisak_theme', 'light');
      localStorage.setItem('studymacha_theme', 'light');
    } catch {
      // Ignore storage restrictions.
    }
  }, [theme]);

  const setTheme = (nextTheme: Theme) => {
    setThemeState(nextTheme);
    const root = document.documentElement;
    root.classList.toggle('dark', nextTheme === 'dark');
    root.classList.toggle('light', nextTheme === 'light');
    root.setAttribute('data-theme', nextTheme);
    root.style.colorScheme = nextTheme;
    try {
      localStorage.setItem('mos_theme', nextTheme);
      localStorage.setItem('javisak_theme', nextTheme);
      localStorage.setItem('studymacha_theme', nextTheme);
    } catch {
      // Ignore storage restrictions.
    }
  };

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode: theme === 'dark', toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
