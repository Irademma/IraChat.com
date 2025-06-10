import { DarkTheme, DefaultTheme } from '@react-navigation/native';
import React, { createContext, useContext, useState } from 'react';
import { useColorScheme } from 'react-native';
import { Colors } from '../constants/Colors';

type Theme = 'light' | 'dark' | 'system';
type ColorScheme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  colorScheme: ColorScheme;
  colors: typeof Colors.light;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const systemColorScheme = useColorScheme();
  const [theme, setTheme] = useState<Theme>('system');

  const colorScheme: ColorScheme = theme === 'system'
    ? (systemColorScheme ?? 'light')
    : theme === 'dark'
    ? 'dark'
    : 'light';

  const colors = Colors[colorScheme];
  const isDark = colorScheme === 'dark';

  // Create React Navigation compatible theme
  const navigationTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      primary: colors.primary,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
      notification: colors.error,
    },
  };

  const value: ThemeContextType = {
    theme,
    colorScheme,
    colors,
    setTheme,
    isDark,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Hook for getting themed styles
export function useThemedStyles<T>(
  styleCreator: (colors: typeof Colors.light, isDark: boolean) => T
): T {
  const { colors, isDark } = useTheme();
  return styleCreator(colors, isDark);
}

// Utility function to get color based on theme
export function getThemeColor(
  lightColor: string,
  darkColor: string,
  isDark: boolean
): string {
  return isDark ? darkColor : lightColor;
}

// Default export for easier importing
export default ThemeProvider;
