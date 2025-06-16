import React from "react";
import { useColorScheme } from "react-native";
import {
  ThemeProvider as NavigationThemeProvider,
  DefaultTheme,
  DarkTheme,
} from "@react-navigation/native";
import { Colors } from "../constants/Colors";

interface ExpoRouterThemeProviderProps {
  children: React.ReactNode;
}

export function ExpoRouterThemeProvider({
  children,
}: ExpoRouterThemeProviderProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = Colors[isDark ? "dark" : "light"];

  // Create React Navigation compatible theme for Expo Router
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

  return (
    <NavigationThemeProvider value={navigationTheme}>
      {children}
    </NavigationThemeProvider>
  );
}
