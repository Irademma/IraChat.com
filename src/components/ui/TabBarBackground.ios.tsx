import React from 'react';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { StyleSheet, useColorScheme } from 'react-native';

export default function BlurTabBarBackground() {
  const colorScheme = useColorScheme();

  return React.createElement(BlurView, {
    tint: colorScheme === 'dark' ? 'dark' : 'light',
    intensity: 85,
    style: StyleSheet.absoluteFill
  });
}

export function useBottomTabOverflow() {
  return useBottomTabBarHeight();
}