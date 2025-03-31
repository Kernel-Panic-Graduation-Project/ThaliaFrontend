import { useMemo } from 'react';
import { useTheme } from '../context/ThemeContext';

export const useViewStyle = () => {
  const { theme } = useTheme();
  
  return useMemo(() => ({
    backgroundColor: theme.colors.background,
    padding: 20,
    flex: 1,
  }), [theme]);
};