// Responsive styles for IraChat
// Comprehensive responsive utility classes and helpers

import { Dimensions } from "react-native";
import {
  borderRadius,
  fontSizes,
  isLargeDevice,
  isSmallDevice,
  isTablet,
  spacing,
} from "../utils/responsive";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Responsive container styles
export const responsiveContainerStyles = {
  // Main containers
  screenContainer: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    paddingHorizontal: isSmallDevice() ? spacing.sm : spacing.md,
  },

  contentContainer: {
    maxWidth: isTablet() ? SCREEN_WIDTH * 0.8 : SCREEN_WIDTH,
    alignSelf: "center",
    width: "100%",
  },

  cardContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: borderRadius.lg,
    padding: isSmallDevice() ? spacing.sm : spacing.md,
    margin: isSmallDevice() ? spacing.xs : spacing.sm,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  // Header containers
  headerContainer: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: spacing.md,
    paddingVertical: isSmallDevice() ? spacing.sm : spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },

  // List containers
  listContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
};

// Responsive text styles
export const responsiveTextStyles = {
  // Headings
  h1: {
    fontSize: fontSizes.xxl,
    fontWeight: "700" as const,
    color: "#111827",
    marginBottom: spacing.sm,
  },

  h2: {
    fontSize: fontSizes.xl,
    fontWeight: "600" as const,
    color: "#111827",
    marginBottom: spacing.sm,
  },

  h3: {
    fontSize: fontSizes.lg,
    fontWeight: "600" as const,
    color: "#374151",
    marginBottom: spacing.xs,
  },

  h4: {
    fontSize: fontSizes.md,
    fontWeight: "500" as const,
    color: "#374151",
    marginBottom: spacing.xs,
  },

  // Body text
  body1: {
    fontSize: fontSizes.md,
    fontWeight: "400" as const,
    color: "#374151",
    lineHeight: fontSizes.md * 1.5,
  },

  body2: {
    fontSize: fontSizes.sm,
    fontWeight: "400" as const,
    color: "#6B7280",
    lineHeight: fontSizes.sm * 1.5,
  },

  // Special text
  caption: {
    fontSize: fontSizes.xs,
    fontWeight: "400" as const,
    color: "#9CA3AF",
    lineHeight: fontSizes.xs * 1.4,
  },

  button: {
    fontSize: fontSizes.md,
    fontWeight: "500" as const,
    textAlign: "center" as const,
  },

  link: {
    fontSize: fontSizes.md,
    fontWeight: "500" as const,
    color: "#3B82F6",
    textDecorationLine: "underline" as const,
  },
};

// Responsive button styles
export const responsiveButtonStyles = {
  // Primary buttons
  primary: {
    backgroundColor: "#3B82F6",
    paddingHorizontal: isSmallDevice() ? spacing.md : spacing.lg,
    paddingVertical: isSmallDevice() ? spacing.sm : spacing.md,
    borderRadius: borderRadius.md,
    minHeight: isSmallDevice() ? 44 : 48,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },

  // Secondary buttons
  secondary: {
    backgroundColor: "#6B7280",
    paddingHorizontal: isSmallDevice() ? spacing.md : spacing.lg,
    paddingVertical: isSmallDevice() ? spacing.sm : spacing.md,
    borderRadius: borderRadius.md,
    minHeight: isSmallDevice() ? 44 : 48,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },

  // Outline buttons
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#3B82F6",
    paddingHorizontal: isSmallDevice() ? spacing.md : spacing.lg,
    paddingVertical: isSmallDevice() ? spacing.sm : spacing.md,
    borderRadius: borderRadius.md,
    minHeight: isSmallDevice() ? 44 : 48,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },

  // Ghost buttons
  ghost: {
    backgroundColor: "transparent",
    paddingHorizontal: isSmallDevice() ? spacing.sm : spacing.md,
    paddingVertical: isSmallDevice() ? spacing.xs : spacing.sm,
    borderRadius: borderRadius.sm,
    minHeight: isSmallDevice() ? 36 : 40,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },

  // Icon buttons
  icon: {
    width: isSmallDevice() ? 40 : 44,
    height: isSmallDevice() ? 40 : 44,
    borderRadius: isSmallDevice() ? 20 : 22,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
};

// Responsive input styles
export const responsiveInputStyles = {
  container: {
    marginBottom: spacing.md,
  },

  label: {
    fontSize: fontSizes.sm,
    fontWeight: "500",
    color: "#374151",
    marginBottom: spacing.xs,
  },

  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: isSmallDevice() ? spacing.sm : spacing.md,
    fontSize: fontSizes.md,
    color: "#111827",
    backgroundColor: "#FFFFFF",
    minHeight: isSmallDevice() ? 44 : 48,
  },

  inputFocused: {
    borderColor: "#3B82F6",
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  inputError: {
    borderColor: "#EF4444",
  },

  helperText: {
    fontSize: fontSizes.xs,
    color: "#6B7280",
    marginTop: spacing.xs,
  },

  errorText: {
    fontSize: fontSizes.xs,
    color: "#EF4444",
    marginTop: spacing.xs,
  },
};

// Responsive layout helpers
export const responsiveLayoutHelpers = {
  // Flex layouts
  row: {
    flexDirection: "row",
    alignItems: "center",
  },

  column: {
    flexDirection: "column",
  },

  center: {
    justifyContent: "center",
    alignItems: "center",
  },

  spaceBetween: {
    justifyContent: "space-between",
    alignItems: "center",
  },

  // Grid layouts
  grid2: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  gridItem2: {
    width: isTablet() ? "48%" : "100%",
    marginBottom: spacing.md,
  },

  grid3: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  gridItem3: {
    width: isTablet() ? "31%" : isLargeDevice() ? "48%" : "100%",
    marginBottom: spacing.md,
  },

  // Spacing
  marginVertical: {
    marginVertical: spacing.md,
  },

  marginHorizontal: {
    marginHorizontal: spacing.md,
  },

  paddingVertical: {
    paddingVertical: spacing.md,
  },

  paddingHorizontal: {
    paddingHorizontal: spacing.md,
  },
};

// Responsive component sizes
export const responsiveComponentSizes = {
  // Avatar sizes
  avatar: {
    small: isSmallDevice() ? 32 : 36,
    medium: isSmallDevice() ? 48 : 52,
    large: isSmallDevice() ? 64 : 72,
    xlarge: isSmallDevice() ? 96 : 108,
  },

  // Icon sizes
  icon: {
    small: isSmallDevice() ? 16 : 18,
    medium: isSmallDevice() ? 20 : 24,
    large: isSmallDevice() ? 24 : 28,
    xlarge: isSmallDevice() ? 32 : 36,
  },

  // List item heights
  listItem: {
    small: isSmallDevice() ? 48 : 52,
    medium: isSmallDevice() ? 60 : 68,
    large: isSmallDevice() ? 72 : 80,
  },

  // Modal sizes
  modal: {
    width: isTablet() ? "80%" : "90%",
    maxHeight: isTablet() ? "80%" : "90%",
  },

  // Bottom sheet sizes
  bottomSheet: {
    height: isSmallDevice() ? "40%" : "50%",
    borderRadius: borderRadius.xl,
  },
};

// Responsive breakpoints
export const breakpoints = {
  small: 320, // Small phones
  medium: 375, // Medium phones
  large: 414, // Large phones
  tablet: 768, // Tablets
  desktop: 1024, // Desktop
};

// Helper functions
export const getResponsiveValue = (
  small: any,
  medium?: any,
  large?: any,
  tablet?: any,
) => {
  if (isTablet() && tablet !== undefined) return tablet;
  if (isLargeDevice() && large !== undefined) return large;
  if (!isSmallDevice() && medium !== undefined) return medium;
  return small;
};

export const getResponsiveStyle = (
  baseStyle: any,
  responsiveOverrides: any = {},
) => {
  const deviceType = isTablet()
    ? "tablet"
    : isLargeDevice()
      ? "large"
      : isSmallDevice()
        ? "small"
        : "medium";
  return {
    ...baseStyle,
    ...(responsiveOverrides[deviceType] || {}),
  };
};

export const combineResponsiveStyles = (...styles: any[]) => {
  return styles.reduce((combined, style) => ({ ...combined, ...style }), {});
};
