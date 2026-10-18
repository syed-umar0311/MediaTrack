import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState('system');
  const [palette, setPalette] = useState('monochrome');
  const [resolvedMode, setResolvedMode] = useState('light');

  // Initialize theme from localStorage
  useEffect(() => {
    const savedMode = localStorage.getItem('theme-mode') || 'system';
    const savedPalette = localStorage.getItem('theme-palette') || 'monochrome';
    setMode(savedMode);
    setPalette(savedPalette);
  }, []);

  // Handle system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e) => {
      if (mode === 'system') {
        setResolvedMode(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);

    // Set initial resolved mode
    if (mode === 'system') {
      setResolvedMode(mediaQuery.matches ? 'dark' : 'light');
    } else {
      setResolvedMode(mode);
    }

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [mode]);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-mode', resolvedMode);
    root.setAttribute('data-palette', palette);
  }, [resolvedMode, palette]);

  const changeMode = (newMode) => {
    setMode(newMode);
    localStorage.setItem('theme-mode', newMode);

    if (newMode !== 'system') {
      setResolvedMode(newMode);
    } else {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setResolvedMode(isDark ? 'dark' : 'light');
    }
  };

  const changePalette = (newPalette) => {
    setPalette(newPalette);
    localStorage.setItem('theme-palette', newPalette);
  };

  return (
    <ThemeContext.Provider
      value={{
        mode,
        palette,
        resolvedMode,
        changeMode,
        changePalette,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
