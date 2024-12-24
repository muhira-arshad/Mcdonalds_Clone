import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';

interface Theme {
  background: string;
  text: string;
  primary: string;
  secondary: string;
  card: string;
  border: string;
  input: string;
  placeholder: string;
}

const lightTheme: Theme = {
  background: '#FFFFFF',
  text: '#000000',
  primary: '#ffbc0d',
  secondary: '#DA291C',
  card: '#F5F5F5',
  border: '#E0E0E0',
  input: '#F0F0F0',
  placeholder: '#A0A0A0',
};

const darkTheme: Theme = {
  background: '#121212',
  text: '#FFFFFF',
  primary: '#ffbc0d',
  secondary: '#DA291C',
  card: '#1E1E1E',
  border: '#333333',
  input: '#2C2C2C',
  placeholder: '#808080',
};

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isDarkMode: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const colorScheme = useColorScheme();
  const [theme, setTheme] = useState<Theme>(colorScheme === 'dark' ? darkTheme : lightTheme);

  useEffect(() => {
    setTheme(colorScheme === 'dark' ? darkTheme : lightTheme);
  }, [colorScheme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === lightTheme ? darkTheme : lightTheme);
  };

  const isDarkMode = theme === darkTheme;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDarkMode }}>
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