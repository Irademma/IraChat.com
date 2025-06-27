/**
 * IraChat Design System
 * 
 * Comprehensive design system to fix UI/UX issues and create
 * a consistent, professional, and user-friendly interface
 */

// COLORS - Simplified and consistent palette
export const colors = {
  // Primary brand colors
  primary: '#667eea',        // IraChat primary blue
  primaryDark: '#5a6fd8',    // Darker shade for depth
  primaryLight: '#87ceeb',   // Sky blue accent
  
  // Neutral colors for text and backgrounds
  white: '#ffffff',
  black: '#000000',
  
  // Gray scale - properly balanced
  gray50: '#f9fafb',         // Very light background
  gray100: '#f3f4f6',        // Light background
  gray200: '#e5e7eb',        // Border light
  gray300: '#d1d5db',        // Border
  gray400: '#9ca3af',        // Text muted
  gray500: '#6b7280',        // Text secondary
  gray600: '#4b5563',        // Text primary
  gray700: '#374151',        // Text dark
  gray800: '#1f2937',        // Text very dark
  gray900: '#111827',        // Text black
  
  // Semantic colors
  success: '#10b981',        // Green for success states
  warning: '#f59e0b',        // Amber for warnings
  error: '#ef4444',          // Red for errors
  info: '#3b82f6',           // Blue for info
  
  // Chat specific colors
  sentMessage: '#667eea',    // Sent message background
  receivedMessage: '#f3f4f6', // Received message background
  online: '#10b981',         // Online status
  offline: '#9ca3af',        // Offline status
  
  // Transparent overlays
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.1)',
};

// TYPOGRAPHY - Improved readability and hierarchy
export const typography = {
  // Font families
  fontFamily: {
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
  },
  
  // Font sizes - Increased for better readability
  fontSize: {
    xs: 12,    // Small labels
    sm: 14,    // Secondary text
    base: 16,  // Body text (increased from 14)
    lg: 18,    // Large body text
    xl: 20,    // Headings
    '2xl': 24, // Large headings
    '3xl': 30, // Page titles
    '4xl': 36, // Hero text
  },
  
  // Font weights
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  
  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
  },
};

// SPACING - Consistent spacing system
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 64,
};

// BORDER RADIUS - Consistent rounded corners
export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
};

// SHADOWS - Subtle depth
export const shadows = {
  sm: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
};

// COMPONENT STYLES - Reusable component styling
export const components = {
  // Button styles
  button: {
    primary: {
      backgroundColor: colors.primary,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.xl,
      borderRadius: borderRadius.lg,
      ...shadows.md,
    },
    secondary: {
      backgroundColor: colors.gray100,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.xl,
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      borderColor: colors.gray300,
    },
  },
  
  // Card styles
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.sm,
  },
  
  // Input styles
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray300,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    fontSize: typography.fontSize.base,
    color: colors.gray700,
  },
  
  // Avatar styles
  avatar: {
    small: {
      width: 32,
      height: 32,
      borderRadius: borderRadius.full,
    },
    medium: {
      width: 48,
      height: 48,
      borderRadius: borderRadius.full,
    },
    large: {
      width: 64,
      height: 64,
      borderRadius: borderRadius.full,
    },
  },
};

// LAYOUT - Consistent layout patterns
export const layout = {
  // Container padding
  containerPadding: spacing.lg,
  
  // Section spacing
  sectionSpacing: spacing['2xl'],
  
  // List item spacing
  listItemSpacing: spacing.md,
  
  // Header height
  headerHeight: 60,
  
  // Tab bar height
  tabBarHeight: 80,
  
  // Safe area padding
  safeAreaPadding: spacing.lg,
};

// TEXT STYLES - Pre-defined text styles for consistency
export const textStyles = {
  // Headings
  h1: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.gray900,
    lineHeight: typography.lineHeight.tight,
  },
  h2: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.gray900,
    lineHeight: typography.lineHeight.tight,
  },
  h3: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.gray800,
    lineHeight: typography.lineHeight.normal,
  },
  
  // Body text
  body: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.normal,
    color: colors.gray700,
    lineHeight: typography.lineHeight.normal,
  },
  bodyLarge: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.normal,
    color: colors.gray700,
    lineHeight: typography.lineHeight.normal,
  },
  
  // Secondary text
  caption: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.normal,
    color: colors.gray500,
    lineHeight: typography.lineHeight.normal,
  },
  
  // Labels
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.gray600,
    lineHeight: typography.lineHeight.normal,
  },
  
  // Button text
  buttonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
    textAlign: 'center' as const,
  },
  
  // Link text
  link: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary,
    textDecorationLine: 'underline' as const,
  },
};

// ANIMATION - Consistent animations
export const animations = {
  // Duration
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
  
  // Easing
  easing: {
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
};

// BREAKPOINTS - Responsive design (for future use)
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
};

export default {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  components,
  layout,
  textStyles,
  animations,
  breakpoints,
};
