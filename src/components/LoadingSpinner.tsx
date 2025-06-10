import React, { useRef, useEffect } from 'react';
import { View, ActivityIndicator, Text, Animated } from 'react-native';
import { useTheme } from './ThemeProvider';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'large';
  color?: string;
  overlay?: boolean;
}

export default function LoadingSpinner({
  message = 'Loading...',
  size = 'large',
  color,
  overlay = false
}: LoadingSpinnerProps) {
  const { colors } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const spinnerColor = color || colors.primary;

  if (overlay) {
    return (
      <Animated.View
        className="absolute inset-0 justify-center items-center z-50"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          opacity: fadeAnim,
        }}
      >
        <Animated.View
          className="bg-white rounded-xl p-6 items-center shadow-lg"
          style={{
            backgroundColor: colors.surface,
            transform: [{ scale: scaleAnim }],
          }}
        >
          <ActivityIndicator size={size} color={spinnerColor} />
          {message && (
            <Text
              className="mt-4 text-base text-center"
              style={{ color: colors.text }}
            >
              {message}
            </Text>
          )}
        </Animated.View>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      className="flex-1 justify-center items-center"
      style={{
        backgroundColor: colors.background,
        opacity: fadeAnim,
        transform: [{ scale: scaleAnim }],
      }}
    >
      <ActivityIndicator size={size} color={spinnerColor} />
      {message && (
        <Text
          className="mt-4 text-base text-center"
          style={{ color: colors.textSecondary }}
        >
          {message}
        </Text>
      )}
    </Animated.View>
  );
}
