import React from 'react';
import { Text, TextStyle, Platform } from 'react-native';
import { useResponsiveFontSizes, useResponsiveDimensions } from '../../hooks/useResponsiveDimensions';

interface ResponsiveTextProps {
  children: React.ReactNode;
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  color?: string;
  align?: 'left' | 'center' | 'right' | 'justify';
  style?: TextStyle;
  className?: string;
  numberOfLines?: number;
  adjustsFontSizeToFit?: boolean;
  minimumFontScale?: number;
}

export function ResponsiveText({
  children,
  size = 'base',
  weight = 'normal',
  color,
  align = 'left',
  style,
  className = '',
  numberOfLines,
  adjustsFontSizeToFit = false,
  minimumFontScale = 0.8,
}: ResponsiveTextProps) {
  const fontSizes = useResponsiveFontSizes();
  const { fontScale } = useResponsiveDimensions();

  const fontWeightMap = {
    normal: '400' as '400',
    medium: '500' as '500',
    semibold: '600' as '600',
    bold: '700' as '700',
  };

  const textStyle: TextStyle = {
    fontSize: fontSizes[size],
    fontWeight: fontWeightMap[weight],
    textAlign: align,
    ...(color && { color }),
    // Ensure proper line height for readability
    lineHeight: fontSizes[size] * 1.4,
    ...style,
  };

  // Web-specific optimizations
  if (Platform.OS === 'web') {
    (textStyle as any).fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    (textStyle as any).WebkitFontSmoothing = 'antialiased';
    (textStyle as any).MozOsxFontSmoothing = 'grayscale';
  }

  return (
    <Text
      style={textStyle}
      className={className}
      numberOfLines={numberOfLines}
      adjustsFontSizeToFit={adjustsFontSizeToFit && Platform.OS !== 'web'}
      minimumFontScale={minimumFontScale}
    >
      {children}
    </Text>
  );
}

// Heading component with predefined styles
interface ResponsiveHeadingProps extends Omit<ResponsiveTextProps, 'size'> {
  level: 1 | 2 | 3 | 4 | 5 | 6;
}

export function ResponsiveHeading({
  level,
  weight = 'bold',
  ...props
}: ResponsiveHeadingProps) {
  const sizeMap = {
    1: '4xl' as const,
    2: '3xl' as const,
    3: '2xl' as const,
    4: 'xl' as const,
    5: 'lg' as const,
    6: 'base' as const,
  };

  return (
    <ResponsiveText
      size={sizeMap[level]}
      weight={weight}
      {...props}
    />
  );
}

// Caption component for small text
export function ResponsiveCaption(props: Omit<ResponsiveTextProps, 'size'>) {
  return (
    <ResponsiveText
      size="xs"
      color="#6B7280"
      {...props}
    />
  );
}

// Body text component with optimized line height
export function ResponsiveBody(props: Omit<ResponsiveTextProps, 'size'>) {
  return (
    <ResponsiveText
      size="base"
      style={{ lineHeight: 24 }}
      {...props}
    />
  );
}

// Link component with interactive styles
interface ResponsiveLinkProps extends ResponsiveTextProps {
  onPress?: () => void;
  href?: string;
}

export function ResponsiveLink({
  onPress,
  href,
  color = '#3B82F6',
  style,
  ...props
}: ResponsiveLinkProps) {
  const linkStyle: TextStyle = {
    textDecorationLine: 'underline',
    ...style,
  };

  if (Platform.OS === 'web' && href) {
    // For web, use anchor tag behavior
    return (
      <ResponsiveText
        color={color}
        style={linkStyle}
        {...props}
      />
    );
  }

  return (
    <ResponsiveText
      color={color}
      style={linkStyle}
      {...props}
    />
  );
}

// Error text component
export function ResponsiveErrorText(props: Omit<ResponsiveTextProps, 'color' | 'size'>) {
  return (
    <ResponsiveText
      size="sm"
      color="#EF4444"
      {...props}
    />
  );
}

// Success text component
export function ResponsiveSuccessText(props: Omit<ResponsiveTextProps, 'color' | 'size'>) {
  return (
    <ResponsiveText
      size="sm"
      color="#667eea"
      {...props}
    />
  );
}

// Muted text component
export function ResponsiveMutedText(props: Omit<ResponsiveTextProps, 'color'>) {
  return (
    <ResponsiveText
      color="#6B7280"
      {...props}
    />
  );
}
