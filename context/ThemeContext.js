import React, { createContext, useContext, useState, useEffect } from 'react';
import { lightTheme, darkTheme } from '../utils/Theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext({
  theme: lightTheme,
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(lightTheme);
  
  // Load theme preference on mount
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const themePreference = await AsyncStorage.getItem('themePreference');
        if (themePreference === 'dark') {
          setTheme(darkTheme);
        }
      } catch (error) {
        console.error('Failed to load theme preference', error);
      }
    };
    
    loadThemePreference();
  }, []);

  const toggleTheme = () => {
    setTheme((prevTheme) => {
      const newTheme = prevTheme.dark ? lightTheme : darkTheme;
      // Save theme preference
      AsyncStorage.setItem('themePreference', newTheme.dark ? 'dark' : 'light')
        .catch(error => console.error('Failed to save theme preference', error));
      return newTheme;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
