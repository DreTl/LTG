import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

const THEMES = ['green', 'blue', 'red', 'gold'];

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('tablegen-theme') || 'green');
  const [darkMode, setDarkMode] = useState(() => {
    const stored = localStorage.getItem('tablegen-dark');
    return stored === null ? true : stored === 'true';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('tablegen-theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    document.body.classList.toggle('dark', darkMode);
    localStorage.setItem('tablegen-dark', darkMode);
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, darkMode, toggleDarkMode, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
