import { useEffect, useState } from 'react';
import { Dimensions } from 'react-native';

export interface ResponsiveDimensions {
  width: number;
  height: number;
  isXSmall: boolean;
  isSmall: boolean;
  isMedium: boolean;
  isLarge: boolean;
  isXLarge: boolean;
  isXXLarge: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  orientation: 'portrait' | 'landscape';
  scale: number;
  fontScale: number;
  deviceType: 'phone' | 'tablet' | 'desktop';
  safeAreaPadding: number;
}

export function useResponsiveDimensions(): ResponsiveDimensions {
  const [dimensions, setDimensions] = useState(() => {
    const { width, height, scale, fontScale } = Dimensions.get('window');
    return { width, height, scale, fontScale };
  });

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions({
        width: window.width,
        height: window.height,
        scale: window.scale,
        fontScale: window.fontScale,
      });
    });

    return () => subscription?.remove();
  }, []);

  const { width, height, scale, fontScale } = dimensions;

  // Enhanced breakpoints for better device coverage
  const isXSmall = width < 360;  // Very small phones
  const isSmall = width >= 360 && width < 480;  // Small phones
  const isMedium = width >= 480 && width < 768;  // Large phones/small tablets
  const isLarge = width >= 768 && width < 1024;  // Tablets
  const isXLarge = width >= 1024 && width < 1440;  // Small desktops
  const isXXLarge = width >= 1440;  // Large desktops

  // Legacy breakpoints for backward compatibility
  const isTablet = width >= 768 && width < 1024;
  const isDesktop = width >= 1024;

  // Orientation
  const orientation = width > height ? 'landscape' : 'portrait';

  // Device type classification
  const deviceType: 'phone' | 'tablet' | 'desktop' =
    width < 768 ? 'phone' :
    width < 1024 ? 'tablet' :
    'desktop';

  // Safe area padding for very small devices
  const safeAreaPadding = isXSmall ? 8 : isSmall ? 12 : 16;

  return {
    width,
    height,
    isXSmall,
    isSmall,
    isMedium,
    isLarge,
    isXLarge,
    isXXLarge,
    isTablet,
    isDesktop,
    orientation,
    scale,
    fontScale,
    deviceType,
    safeAreaPadding,
  };
}

// Enhanced responsive value selector
export function useResponsiveValue<T>(values: {
  xsmall?: T;
  small?: T;
  medium?: T;
  large?: T;
  xlarge?: T;
  xxlarge?: T;
  tablet?: T;
  desktop?: T;
  default: T;
}): T {
  const { isXSmall, isSmall, isMedium, isLarge, isXLarge, isXXLarge, isTablet, isDesktop } = useResponsiveDimensions();

  if (isXXLarge && values.xxlarge !== undefined) return values.xxlarge;
  if (isXLarge && values.xlarge !== undefined) return values.xlarge;
  if (isDesktop && values.desktop !== undefined) return values.desktop;
  if (isTablet && values.tablet !== undefined) return values.tablet;
  if (isLarge && values.large !== undefined) return values.large;
  if (isMedium && values.medium !== undefined) return values.medium;
  if (isSmall && values.small !== undefined) return values.small;
  if (isXSmall && values.xsmall !== undefined) return values.xsmall;

  return values.default;
}

// Enhanced responsive spacing with overlap prevention
export function useResponsiveSpacing() {
  const { isXSmall, isSmall, isMedium, isLarge, isXLarge, safeAreaPadding } = useResponsiveDimensions();

  return {
    // Base spacing that prevents overlaps
    xs: isXSmall ? 2 : isSmall ? 4 : 6,
    sm: isXSmall ? 4 : isSmall ? 8 : 12,
    md: isXSmall ? 8 : isSmall ? 12 : 16,
    lg: isXSmall ? 12 : isSmall ? 16 : 24,
    xl: isXSmall ? 16 : isSmall ? 24 : 32,
    xxl: isXSmall ? 24 : isSmall ? 32 : 48,

    // Safe area padding
    safeArea: safeAreaPadding,

    // Container spacing with minimum safe values
    containerPadding: Math.max(safeAreaPadding, isXSmall ? 12 : isSmall ? 16 : isMedium ? 24 : 32),
    sectionSpacing: isXSmall ? 12 : isSmall ? 16 : isMedium ? 24 : 32,
    itemSpacing: isXSmall ? 6 : isSmall ? 8 : isMedium ? 12 : 16,

    // Button spacing with minimum touch targets
    buttonPadding: {
      horizontal: Math.max(12, isXSmall ? 12 : isSmall ? 16 : isMedium ? 20 : 24),
      vertical: Math.max(10, isXSmall ? 10 : isSmall ? 12 : isMedium ? 14 : 16),
    },

    // Input spacing with accessibility compliance
    inputPadding: {
      horizontal: Math.max(10, isXSmall ? 10 : isSmall ? 12 : isMedium ? 16 : 20),
      vertical: Math.max(10, isXSmall ? 10 : isSmall ? 12 : isMedium ? 14 : 16),
    },

    // Minimum touch target size (44px iOS, 48px Android)
    minTouchTarget: 44,

    // Header and navigation spacing
    headerPadding: {
      horizontal: Math.max(safeAreaPadding, isXSmall ? 8 : isSmall ? 12 : 16),
      vertical: isXSmall ? 8 : isSmall ? 12 : 16,
    },
  };
}

// Enhanced responsive font sizes with overlap prevention
export function useResponsiveFontSizes() {
  const { isXSmall, isSmall, isMedium, isLarge, isXLarge, fontScale } = useResponsiveDimensions();

  const baseSizes = {
    xs: isXSmall ? 10 : isSmall ? 12 : isMedium ? 13 : 14,
    sm: isXSmall ? 12 : isSmall ? 14 : isMedium ? 15 : 16,
    base: isXSmall ? 14 : isSmall ? 16 : isMedium ? 17 : isLarge ? 18 : 19,
    lg: isXSmall ? 16 : isSmall ? 18 : isMedium ? 20 : isLarge ? 22 : 24,
    xl: isXSmall ? 18 : isSmall ? 20 : isMedium ? 22 : isLarge ? 24 : 26,
    '2xl': isXSmall ? 20 : isSmall ? 24 : isMedium ? 28 : isLarge ? 32 : 36,
    '3xl': isXSmall ? 24 : isSmall ? 30 : isMedium ? 36 : isLarge ? 42 : 48,
    '4xl': isXSmall ? 28 : isSmall ? 36 : isMedium ? 42 : isLarge ? 48 : 56,
  };

  // Apply font scale for accessibility with limits to prevent overflow
  const scaledSizes = Object.entries(baseSizes).reduce((acc, [key, size]) => {
    const scaledSize = Math.round(size * fontScale);
    // Limit maximum font scale to prevent UI breaking
    const maxScale = isXSmall ? 1.3 : isSmall ? 1.5 : 2.0;
    const limitedSize = Math.min(scaledSize, size * maxScale);
    acc[key as keyof typeof baseSizes] = limitedSize;
    return acc;
  }, {} as typeof baseSizes);

  return scaledSizes;
}

// Enhanced responsive layout values with overlap prevention
export function useResponsiveLayout() {
  const { isXSmall, isSmall, isMedium, isLarge, isXLarge, isDesktop, orientation, width, height, safeAreaPadding } = useResponsiveDimensions();

  return {
    // Grid with better small device support
    gridColumns: isXSmall ? 1 : isSmall ? 1 : isMedium ? 2 : isLarge ? 3 : 4,

    // Container with safe margins
    maxContentWidth: isXSmall ? '100%' : isSmall ? '100%' : isMedium ? 600 : isLarge ? 800 : 1200,
    contentPadding: Math.max(safeAreaPadding, isXSmall ? 8 : isSmall ? 12 : 16),

    // Navigation with minimum heights
    tabBarHeight: Math.max(50, isXSmall ? 50 : isSmall ? 60 : 70),
    headerHeight: Math.max(44, isXSmall ? 44 : isSmall ? 56 : 64),

    // Modal with device-appropriate sizing
    modalWidth: isXSmall ? '98%' : isSmall ? '95%' : isMedium ? '85%' : isLarge ? '70%' : '60%',
    modalMaxWidth: isXSmall ? Math.min(width - 16, 350) : isSmall ? 400 : isMedium ? 500 : 600,
    modalMinHeight: Math.min(height * 0.3, 200),
    modalMaxHeight: height * 0.9,

    // Chat with responsive message sizing
    chatListColumns: isDesktop && orientation === 'landscape' && width > 1200 ? 2 : 1,
    messageMaxWidth: isXSmall ? '90%' : isSmall ? '85%' : '75%',
    messageMinWidth: isXSmall ? 120 : 150,

    // Profile with scalable avatars
    avatarSize: {
      tiny: isXSmall ? 24 : 28,
      small: isXSmall ? 28 : isSmall ? 32 : 36,
      medium: isXSmall ? 40 : isSmall ? 48 : 56,
      large: isXSmall ? 64 : isSmall ? 80 : 96,
      xlarge: isXSmall ? 96 : isSmall ? 120 : 144,
      xxlarge: isXSmall ? 128 : isSmall ? 160 : 192,
    },

    // Input and button minimum sizes
    minButtonHeight: 44, // iOS accessibility guideline
    minInputHeight: 40,
    minTouchTarget: 44,

    // List item heights
    listItemHeight: {
      compact: isXSmall ? 48 : 56,
      normal: isXSmall ? 56 : isSmall ? 64 : 72,
      large: isXSmall ? 72 : isSmall ? 80 : 88,
    },

    // Card and component spacing
    cardPadding: Math.max(safeAreaPadding, isXSmall ? 12 : isSmall ? 16 : 20),
    cardMargin: isXSmall ? 8 : isSmall ? 12 : 16,
    borderRadius: isXSmall ? 8 : isSmall ? 12 : 16,

    // Safe area considerations
    safeAreaTop: safeAreaPadding,
    safeAreaBottom: safeAreaPadding,
    safeAreaLeft: safeAreaPadding,
    safeAreaRight: safeAreaPadding,
  };
}
