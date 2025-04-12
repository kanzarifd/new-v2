import React, { createContext, useContext, useState, useEffect } from 'react';

interface ThemeContextType {
  mode: 'light' | 'dark';
  setMode: (mode: 'light' | 'dark') => void;
  colorScheme: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
  };
  setColorScheme: (scheme: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
  }) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<'light' | 'dark'>('light');
  const [colorScheme, setColorScheme] = useState({
    primary: '#1976d2',
    secondary: '#dc004e',
    background: '#f5f5f5',
    text: '#000000',
  });

  useEffect(() => {
    const savedMode = localStorage.getItem('themeMode');
    if (savedMode) {
      setMode(savedMode as 'light' | 'dark');
    }

    const savedScheme = localStorage.getItem('themeColorScheme');
    if (savedScheme) {
      try {
        const scheme = JSON.parse(savedScheme);
        setColorScheme(scheme);
      } catch (error) {
        console.error('Error parsing saved color scheme:', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('themeMode', mode);
  }, [mode]);

  useEffect(() => {
    localStorage.setItem('themeColorScheme', JSON.stringify(colorScheme));
  }, [colorScheme]);

  return (
    <ThemeContext.Provider value={{ mode, setMode, colorScheme, setColorScheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
