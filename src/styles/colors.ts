/**
 * Color palette for IraChat
 */

export const colors = {
  // Primary colors
  primary: '#667eea',
  primaryDark: '#5a67d8',
  primaryLight: '#7c3aed',
  accent: '#f093fb',
  
  // Background colors
  background: '#ffffff',
  backgroundSecondary: '#f8fafc',
  surface: '#ffffff',
  card: '#ffffff',
  secondary: '#f1f5f9',
  
  // Text colors
  text: '#1a202c',
  textSecondary: '#718096',
  textLight: '#a0aec0',
  
  // Border colors
  border: '#e2e8f0',
  borderLight: '#f7fafc',
  
  // Status colors
  success: '#48bb78',
  error: '#f56565',
  warning: '#ed8936',
  info: '#4299e1',
  
  // Chat colors
  sent: '#667eea',
  received: '#f7fafc',
  online: '#48bb78',
  offline: '#a0aec0',
  
  // Neutral colors
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827'
  },
  
  // Blue shades
  blue: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a'
  },
  
  // Purple shades
  purple: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
    600: '#9333ea',
    700: '#7c3aed',
    800: '#6b21a8',
    900: '#581c87'
  },
  
  // Green shades
  green: {
    50: '#f0fff4',
    100: '#c6f6d5',
    200: '#9ae6b4',
    300: '#68d391',
    400: '#48bb78',
    500: '#38a169',
    600: '#2f855a',
    700: '#276749',
    800: '#22543d',
    900: '#1a202c'
  },
  
  // Red shades
  red: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d'
  },
  
  // Yellow shades
  yellow: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f'
  },
  
  // Special colors
  shadow: 'rgba(0, 0, 0, 0.1)',
  overlay: 'rgba(0, 0, 0, 0.5)',
  backdrop: 'rgba(0, 0, 0, 0.3)',

  // Additional colors for compatibility
  white: '#ffffff',
  black: '#000000',
  dark: '#000000', // Simple dark color
  inputBackground: '#f8fafc',

  // Skeleton loading
  skeleton: '#e2e8f0',
  skeletonHighlight: '#f1f5f9',

  // Ripple effect
  ripple: 'rgba(102, 126, 234, 0.2)',

  // Dark mode colors (for future use)
  darkMode: {
    background: '#1a202c',
    surface: '#2d3748',
    text: '#f7fafc',
    textSecondary: '#a0aec0',
    border: '#4a5568'
  },
  
  // Group chat colors
  group: {
    admin: '#f093fb',
    member: '#667eea',
    muted: '#a0aec0'
  },
  
  // Update/Story colors
  story: {
    viewed: '#a0aec0',
    unviewed: '#667eea',
    own: '#f093fb'
  },
  
  // Call colors
  call: {
    incoming: '#48bb78',
    outgoing: '#667eea',
    missed: '#f56565',
    video: '#7c3aed'
  }
};

// Color utility functions
export const getColorWithOpacity = (color: string, opacity: number): string => {
  // Convert hex to rgba
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

export const lightenColor = (color: string, amount: number): string => {
  const hex = color.replace('#', '');
  const r = Math.min(255, parseInt(hex.substring(0, 2), 16) + amount);
  const g = Math.min(255, parseInt(hex.substring(2, 4), 16) + amount);
  const b = Math.min(255, parseInt(hex.substring(4, 6), 16) + amount);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

export const darkenColor = (color: string, amount: number): string => {
  const hex = color.replace('#', '');
  const r = Math.max(0, parseInt(hex.substring(0, 2), 16) - amount);
  const g = Math.max(0, parseInt(hex.substring(2, 4), 16) - amount);
  const b = Math.max(0, parseInt(hex.substring(4, 6), 16) - amount);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

export default colors;
