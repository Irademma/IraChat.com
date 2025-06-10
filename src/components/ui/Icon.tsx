import React from 'react';
import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface IconProps {
  name: keyof typeof Ionicons.glyphMap;
  size?: number;
  color?: string;
  style?: any;
}

export function Icon({ name, size = 24, color = '#000', style }: IconProps) {
  // For web platform, we need to handle icon loading more gracefully
  if (Platform.OS === 'web') {
    try {
      return (
        <Ionicons
          name={name}
          size={size}
          color={color}
          style={style}
        />
      );
    } catch (error) {
      // Fallback for web when icons don't load
      console.warn('Icon loading failed:', error);
      return (
        <div
          style={{
            width: size,
            height: size,
            backgroundColor: color,
            borderRadius: size / 2,
            ...style,
          }}
        />
      );
    }
  }

  // For native platforms, use Ionicons directly
  return (
    <Ionicons
      name={name}
      size={size}
      color={color}
      style={style}
    />
  );
}

// Responsive Icon Component
interface ResponsiveIconProps extends IconProps {
  sizeVariant?: 'xs' | 'sm' | 'base' | 'lg' | 'xl';
}

export function ResponsiveIcon({ 
  name, 
  sizeVariant = 'base', 
  color = '#000', 
  style 
}: ResponsiveIconProps) {
  const { useResponsiveDesign } = require('../../hooks/useResponsiveDesign');
  const { breakpoints } = useResponsiveDesign();

  const sizeMap = {
    xs: breakpoints.isSmall ? 12 : 14,
    sm: breakpoints.isSmall ? 16 : 18,
    base: breakpoints.isSmall ? 20 : 24,
    lg: breakpoints.isSmall ? 24 : 28,
    xl: breakpoints.isSmall ? 28 : 32,
  };

  const iconSize = sizeMap[sizeVariant];

  return (
    <Icon
      name={name}
      size={iconSize}
      color={color}
      style={style}
    />
  );
}
