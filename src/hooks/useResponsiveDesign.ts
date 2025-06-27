import { useEffect, useState } from "react";
import { Dimensions, Platform } from "react-native";

export interface ScreenDimensions {
  width: number;
  height: number;
  scale: number;
  fontScale: number;
}

export interface ResponsiveBreakpoints {
  isXS: boolean;
  isSM: boolean;
  isMD: boolean;
  isLG: boolean;
  isXL: boolean;
  isXXL: boolean;
  isXXXL: boolean;
  // Legacy support
  isSmall: boolean;
  isMedium: boolean;
  isLarge: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isMobile: boolean;
}

export interface ResponsiveValues {
  dimensions: ScreenDimensions;
  breakpoints: ResponsiveBreakpoints;
  orientation: "portrait" | "landscape";
  deviceType: "mobile" | "tablet" | "desktop";
}

// Enhanced breakpoint definitions for perfect responsiveness
const BREAKPOINTS = {
  xs: 0, // Extra small phones
  sm: 375, // Small phones
  md: 480, // Large phones / small tablets
  lg: 768, // Tablets
  xl: 1024, // Small desktops
  xxl: 1440, // Large desktops
  xxxl: 1920, // Extra large desktops
  // Legacy support
  small: 0,
  medium: 480,
  large: 768,
  tablet: 768,
  desktop: 1024,
} as const;

function getBreakpoints(width: number): ResponsiveBreakpoints {
  return {
    // New enhanced breakpoints
    isXS: width < BREAKPOINTS.sm,
    isSM: width >= BREAKPOINTS.sm && width < BREAKPOINTS.md,
    isMD: width >= BREAKPOINTS.md && width < BREAKPOINTS.lg,
    isLG: width >= BREAKPOINTS.lg && width < BREAKPOINTS.xl,
    isXL: width >= BREAKPOINTS.xl && width < BREAKPOINTS.xxl,
    isXXL: width >= BREAKPOINTS.xxl && width < BREAKPOINTS.xxxl,
    isXXXL: width >= BREAKPOINTS.xxxl,
    // Legacy support
    isSmall: width < BREAKPOINTS.medium,
    isMedium: width >= BREAKPOINTS.medium && width < BREAKPOINTS.large,
    isLarge: width >= BREAKPOINTS.large,
    isTablet: width >= BREAKPOINTS.tablet && width < BREAKPOINTS.desktop,
    isDesktop: width >= BREAKPOINTS.desktop,
    isMobile: width < BREAKPOINTS.tablet,
  };
}

function getDeviceType(width: number): "mobile" | "tablet" | "desktop" {
  if (Platform.OS === "web") {
    if (width >= BREAKPOINTS.xl) return "desktop";
    if (width >= BREAKPOINTS.lg) return "tablet";
    return "mobile";
  }

  // For native platforms, use enhanced physical screen size detection
  if (width >= BREAKPOINTS.xl) return "desktop";
  if (width >= BREAKPOINTS.lg) return "tablet";
  return "mobile";
}

function getOrientation(
  width: number,
  height: number,
): "portrait" | "landscape" {
  return width > height ? "landscape" : "portrait";
}

export function useResponsiveDesign(): ResponsiveValues {
  const [dimensions, setDimensions] = useState<ScreenDimensions>(() => {
    const { width, height, scale, fontScale } = Dimensions.get("window");
    return { width, height, scale, fontScale };
  });

  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      setDimensions({
        width: window.width,
        height: window.height,
        scale: window.scale,
        fontScale: window.fontScale,
      });
    });

    return () => subscription?.remove();
  }, []);

  const breakpoints = getBreakpoints(dimensions.width);
  const deviceType = getDeviceType(dimensions.width);
  const orientation = getOrientation(dimensions.width, dimensions.height);

  return {
    dimensions,
    breakpoints,
    orientation,
    deviceType,
  };
}

// Responsive value selector hook
export function useResponsiveValue<T>(values: {
  mobile?: T;
  tablet?: T;
  desktop?: T;
  small?: T;
  medium?: T;
  large?: T;
}): T | undefined {
  const { breakpoints, deviceType } = useResponsiveDesign();

  // Priority order: device type first, then breakpoint size
  if (values[deviceType] !== undefined) {
    return values[deviceType];
  }

  if (breakpoints.isLarge && values.large !== undefined) {
    return values.large;
  }

  if (breakpoints.isMedium && values.medium !== undefined) {
    return values.medium;
  }

  if (breakpoints.isSmall && values.small !== undefined) {
    return values.small;
  }

  // Fallback to mobile if nothing else matches
  return values.mobile;
}

// Enhanced responsive spacing hook for perfect device adaptation
export function useResponsiveSpacing() {
  const { breakpoints } = useResponsiveDesign();

  return {
    // Container padding - enhanced for all screen sizes
    containerPadding: breakpoints.isXS
      ? 12
      : breakpoints.isSM
        ? 16
        : breakpoints.isMD
          ? 20
          : breakpoints.isLG
            ? 24
            : breakpoints.isXL
              ? 32
              : breakpoints.isXXL
                ? 40
                : 48,

    // Section spacing
    sectionSpacing: breakpoints.isXS
      ? 12
      : breakpoints.isSM
        ? 16
        : breakpoints.isMD
          ? 20
          : breakpoints.isLG
            ? 24
            : breakpoints.isXL
              ? 32
              : breakpoints.isXXL
                ? 40
                : 48,

    // Item spacing
    itemSpacing: breakpoints.isXS
      ? 6
      : breakpoints.isSM
        ? 8
        : breakpoints.isMD
          ? 10
          : breakpoints.isLG
            ? 12
            : breakpoints.isXL
              ? 16
              : breakpoints.isXXL
                ? 20
                : 24,

    // Button padding
    buttonPadding: {
      horizontal: breakpoints.isXS
        ? 12
        : breakpoints.isSM
          ? 16
          : breakpoints.isMD
            ? 20
            : breakpoints.isLG
              ? 24
              : breakpoints.isXL
                ? 28
                : breakpoints.isXXL
                  ? 32
                  : 36,
      vertical: breakpoints.isXS
        ? 8
        : breakpoints.isSM
          ? 10
          : breakpoints.isMD
            ? 12
            : breakpoints.isLG
              ? 14
              : breakpoints.isXL
                ? 16
                : breakpoints.isXXL
                  ? 18
                  : 20,
    },

    // Input padding
    inputPadding: {
      horizontal: breakpoints.isXS
        ? 10
        : breakpoints.isSM
          ? 12
          : breakpoints.isMD
            ? 16
            : breakpoints.isLG
              ? 20
              : breakpoints.isXL
                ? 24
                : breakpoints.isXXL
                  ? 28
                  : 32,
      vertical: breakpoints.isXS
        ? 8
        : breakpoints.isSM
          ? 10
          : breakpoints.isMD
            ? 12
            : breakpoints.isLG
              ? 14
              : breakpoints.isXL
                ? 16
                : breakpoints.isXXL
                  ? 18
                  : 20,
    },

    // Safe area padding
    safeArea: breakpoints.isXS
      ? 8
      : breakpoints.isSM
        ? 12
        : breakpoints.isMD
          ? 16
          : 20,

    // Legacy support
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
  };
}

// Enhanced responsive font sizes hook for perfect readability across all devices
export function useResponsiveFontSizes() {
  const { breakpoints, dimensions } = useResponsiveDesign();
  const { fontScale } = dimensions;

  const baseSizes = {
    xs: breakpoints.isXS
      ? 10
      : breakpoints.isSM
        ? 11
        : breakpoints.isMD
          ? 12
          : breakpoints.isLG
            ? 13
            : breakpoints.isXL
              ? 14
              : breakpoints.isXXL
                ? 15
                : 16,
    sm: breakpoints.isXS
      ? 12
      : breakpoints.isSM
        ? 13
        : breakpoints.isMD
          ? 14
          : breakpoints.isLG
            ? 15
            : breakpoints.isXL
              ? 16
              : breakpoints.isXXL
                ? 17
                : 18,
    base: breakpoints.isXS
      ? 14
      : breakpoints.isSM
        ? 15
        : breakpoints.isMD
          ? 16
          : breakpoints.isLG
            ? 17
            : breakpoints.isXL
              ? 18
              : breakpoints.isXXL
                ? 19
                : 20,
    lg: breakpoints.isXS
      ? 16
      : breakpoints.isSM
        ? 17
        : breakpoints.isMD
          ? 18
          : breakpoints.isLG
            ? 20
            : breakpoints.isXL
              ? 22
              : breakpoints.isXXL
                ? 24
                : 26,
    xl: breakpoints.isXS
      ? 18
      : breakpoints.isSM
        ? 19
        : breakpoints.isMD
          ? 20
          : breakpoints.isLG
            ? 22
            : breakpoints.isXL
              ? 24
              : breakpoints.isXXL
                ? 26
                : 28,
    "2xl": breakpoints.isXS
      ? 20
      : breakpoints.isSM
        ? 22
        : breakpoints.isMD
          ? 24
          : breakpoints.isLG
            ? 28
            : breakpoints.isXL
              ? 32
              : breakpoints.isXXL
                ? 36
                : 40,
    "3xl": breakpoints.isXS
      ? 24
      : breakpoints.isSM
        ? 28
        : breakpoints.isMD
          ? 30
          : breakpoints.isLG
            ? 36
            : breakpoints.isXL
              ? 42
              : breakpoints.isXXL
                ? 48
                : 54,
    "4xl": breakpoints.isXS
      ? 28
      : breakpoints.isSM
        ? 32
        : breakpoints.isMD
          ? 36
          : breakpoints.isLG
            ? 42
            : breakpoints.isXL
              ? 48
              : breakpoints.isXXL
                ? 56
                : 64,
  };

  // Apply font scale for accessibility
  const scaledSizes = Object.entries(baseSizes).reduce(
    (acc, [key, size]) => {
      acc[key as keyof typeof baseSizes] = Math.round(size * fontScale);
      return acc;
    },
    {} as typeof baseSizes,
  );

  return scaledSizes;
}

// Enhanced responsive layout hook for perfect cross-device compatibility
export function useResponsiveLayout() {
  const { breakpoints, deviceType, orientation } = useResponsiveDesign();

  return {
    // Grid columns - enhanced for all screen sizes
    gridColumns: breakpoints.isXS
      ? 1
      : breakpoints.isSM
        ? 1
        : breakpoints.isMD
          ? 2
          : breakpoints.isLG
            ? 2
            : breakpoints.isXL
              ? 3
              : breakpoints.isXXL
                ? 4
                : 5,

    // Max content width - responsive for all devices
    maxContentWidth: breakpoints.isXS
      ? "100%"
      : breakpoints.isSM
        ? "100%"
        : breakpoints.isMD
          ? 600
          : breakpoints.isLG
            ? 800
            : breakpoints.isXL
              ? 1000
              : breakpoints.isXXL
                ? 1200
                : 1400,

    // Chat list layout
    chatListColumns:
      deviceType === "desktop" && orientation === "landscape" ? 2 : 1,

    // Tab bar layout - responsive heights
    tabBarHeight: breakpoints.isXS
      ? 56
      : breakpoints.isSM
        ? 60
        : breakpoints.isMD
          ? 64
          : breakpoints.isLG
            ? 68
            : breakpoints.isXL
              ? 72
              : 76,

    // Header height - responsive
    headerHeight: breakpoints.isXS
      ? 52
      : breakpoints.isSM
        ? 56
        : breakpoints.isMD
          ? 60
          : breakpoints.isLG
            ? 64
            : breakpoints.isXL
              ? 68
              : 72,

    // Modal sizing - enhanced responsiveness
    modalWidth: breakpoints.isXS
      ? "98%"
      : breakpoints.isSM
        ? "95%"
        : breakpoints.isMD
          ? "85%"
          : breakpoints.isLG
            ? "75%"
            : breakpoints.isXL
              ? "65%"
              : breakpoints.isXXL
                ? "55%"
                : "45%",
    modalMaxWidth: breakpoints.isXS
      ? 350
      : breakpoints.isSM
        ? 400
        : breakpoints.isMD
          ? 500
          : breakpoints.isLG
            ? 600
            : breakpoints.isXL
              ? 700
              : breakpoints.isXXL
                ? 800
                : 900,
    modalMaxHeight: "90%",
    modalMinHeight: breakpoints.isXS
      ? 200
      : breakpoints.isSM
        ? 250
        : breakpoints.isMD
          ? 300
          : 350,

    // Card layout
    cardPadding: breakpoints.isXS
      ? 12
      : breakpoints.isSM
        ? 16
        : breakpoints.isMD
          ? 20
          : breakpoints.isLG
            ? 24
            : 28,
    cardMargin: breakpoints.isXS
      ? 8
      : breakpoints.isSM
        ? 12
        : breakpoints.isMD
          ? 16
          : 20,
    borderRadius: breakpoints.isXS
      ? 8
      : breakpoints.isSM
        ? 10
        : breakpoints.isMD
          ? 12
          : breakpoints.isLG
            ? 14
            : 16,
  };
}
