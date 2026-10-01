import React, { createContext, useContext, useEffect } from 'react';

export type Theme = 'dark';

interface ThemeContextType {
  theme: Theme;
  isDarkMode: boolean;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  isDarkMode: true,
  toggleTheme: () => {},
  setTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('dark');
    root.classList.remove('light');
    root.setAttribute('data-theme', 'dark');
    root.style.colorScheme = 'dark';

    try {
      localStorage.setItem('mos_theme', 'dark');
      localStorage.setItem('javisak_theme', 'dark');
      localStorage.setItem('studymacha_theme', 'dark');
    } catch {
      // Ignore storage restrictions.
    }
  }, []);

  const setTheme = (_theme: Theme) => {};
  const toggleTheme = () => {};

  return (
    <ThemeContext.Provider value={{ theme: 'dark', isDarkMode: true, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
