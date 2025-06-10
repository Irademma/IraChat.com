/**
 * IraChat Color System
 * Comprehensive color palette for light and dark themes
 */

const primaryBlue = '#3B82F6';
const primaryBlueDark = '#2563EB';

export const Colors = {
  light: {
    // Primary colors
    primary: primaryBlue,
    primaryDark: primaryBlueDark,
    secondary: '#667eea',
    accent: '#F59E0B',

    // Text colors
    text: '#111827',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',

    // Background colors
    background: '#FFFFFF',
    backgroundSecondary: '#F9FAFB',
    backgroundMuted: '#F3F4F6',

    // Surface colors
    surface: '#FFFFFF',
    surfaceSecondary: '#F8FAFC',

    // Border colors
    border: '#E5E7EB',
    borderLight: '#F3F4F6',

    // Status colors
    success: '#667eea',
    warning: '#F59E0B',
    error: '#EF4444',
    info: primaryBlue,

    // Chat specific
    messageBubbleOwn: primaryBlue,
    messageBubbleOther: '#F3F4F6',
    messageTextOwn: '#FFFFFF',
    messageTextOther: '#111827',

    // Navigation
    tint: primaryBlue,
    icon: '#6B7280',
    tabIconDefault: '#9CA3AF',
    tabIconSelected: primaryBlue,
  },
  dark: {
    // Primary colors
    primary: '#60A5FA',
    primaryDark: '#3B82F6',
    secondary: '#667eea',
    accent: '#FBBF24',

    // Text colors
    text: '#F9FAFB',
    textSecondary: '#D1D5DB',
    textMuted: '#9CA3AF',

    // Background colors
    background: '#111827',
    backgroundSecondary: '#1F2937',
    backgroundMuted: '#374151',

    // Surface colors
    surface: '#1F2937',
    surfaceSecondary: '#374151',

    // Border colors
    border: '#374151',
    borderLight: '#4B5563',

    // Status colors
    success: '#667eea',
    warning: '#FBBF24',
    error: '#F87171',
    info: '#60A5FA',

    // Chat specific
    messageBubbleOwn: '#3B82F6',
    messageBubbleOther: '#374151',
    messageTextOwn: '#FFFFFF',
    messageTextOther: '#F9FAFB',

    // Navigation
    tint: '#60A5FA',
    icon: '#9CA3AF',
    tabIconDefault: '#6B7280',
    tabIconSelected: '#60A5FA',
  },
};
