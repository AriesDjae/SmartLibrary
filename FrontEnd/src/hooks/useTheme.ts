import { useState, useEffect } from 'react';
import { Theme } from '../types';

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>({ mode: 'light' });

  useEffect(() => {
    const savedTheme = localStorage.getItem('library-theme');
    if (savedTheme) {
      const parsedTheme = JSON.parse(savedTheme);
      setTheme(parsedTheme);
      document.documentElement.classList.toggle('dark', parsedTheme.mode === 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme: Theme = { mode: theme.mode === 'light' ? 'dark' : 'light' };
    setTheme(newTheme);
    localStorage.setItem('library-theme', JSON.stringify(newTheme));
    document.documentElement.classList.toggle('dark', newTheme.mode === 'dark');
  };

  return { theme, toggleTheme };
}; 