import { useMemo } from 'react';
import { useTheme } from '../context/ThemeContext';

export const useScreenOptions = () => {
  const { theme } = useTheme();
  
  return useMemo(() => ({
    headerStyle: {
      backgroundColor: theme.colors.background,
    },
    headerTintColor: theme.colors.primaryText,
    contentStyle: {
      backgroundColor: theme.colors.background,
    },
    animation: 'fade',
  }), [theme]);
};