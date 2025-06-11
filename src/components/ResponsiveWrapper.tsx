import React from 'react';
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import {
    borderRadius,
    fontSizes,
    getGridColumns,
    isLargeDevice,
    isSmallDevice,
    isTablet,
    spacing,
    wp
} from '../utils/responsive';

interface ResponsiveWrapperProps {
  children: React.ReactNode;
  style?: ViewStyle;
  className?: string;
  
  // Layout options
  maxWidth?: boolean;
  centered?: boolean;
  padding?: boolean;
  margin?: boolean;
  fullHeight?: boolean;
  safeArea?: boolean;
  scrollable?: boolean;
  
  // Grid options
  grid?: boolean;
  columns?: number;
  
  // Responsive behavior
  tabletMaxWidth?: number;
  phoneMaxWidth?: number;
  
  // Custom responsive styles
  smallDeviceStyle?: ViewStyle;
  tabletStyle?: ViewStyle;
  largeDeviceStyle?: ViewStyle;
}

export default function ResponsiveWrapper({
  children,
  style,
  className = '',
  
  // Layout options
  maxWidth = false,
  centered = false,
  padding = false,
  margin = false,
  fullHeight = false,
  safeArea = false,
  scrollable = false,
  
  // Grid options
  grid = false,
  columns,
  
  // Responsive behavior
  tabletMaxWidth = 80,
  phoneMaxWidth = 100,
  
  // Custom responsive styles
  smallDeviceStyle,
  tabletStyle,
  largeDeviceStyle,
}: ResponsiveWrapperProps) {
  
  // Get responsive styles based on device type
  const getResponsiveStyles = (): ViewStyle => {
    let responsiveStyle: ViewStyle = {};
    
    // Device-specific styles
    if (isSmallDevice() && smallDeviceStyle) {
      responsiveStyle = { ...responsiveStyle, ...smallDeviceStyle };
    } else if (isTablet() && tabletStyle) {
      responsiveStyle = { ...responsiveStyle, ...tabletStyle };
    } else if (isLargeDevice() && largeDeviceStyle) {
      responsiveStyle = { ...responsiveStyle, ...largeDeviceStyle };
    }
    
    // Layout styles
    if (fullHeight) {
      responsiveStyle.flex = 1;
    }
    
    if (maxWidth) {
      if (isTablet()) {
        responsiveStyle.maxWidth = wp(tabletMaxWidth);
      } else {
        responsiveStyle.maxWidth = wp(phoneMaxWidth);
      }
      responsiveStyle.width = '100%';
    }
    
    if (centered) {
      responsiveStyle.alignSelf = 'center';
      responsiveStyle.alignItems = 'center';
    }
    
    if (padding) {
      responsiveStyle.padding = spacing.md;
    }
    
    if (margin) {
      responsiveStyle.margin = spacing.sm;
    }
    
    // Grid styles
    if (grid) {
      const gridColumns = columns || getGridColumns();
      responsiveStyle.flexDirection = 'row';
      responsiveStyle.flexWrap = 'wrap';
      responsiveStyle.justifyContent = 'space-between';
    }
    
    return responsiveStyle;
  };
  
  const finalStyle: ViewStyle = {
    ...getResponsiveStyles(),
    ...style,
  };
  
  const WrapperComponent = safeArea ? SafeAreaView : View;
  
  if (scrollable) {
    return (
      <WrapperComponent style={finalStyle} className={className}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            flexGrow: 1,
            padding: padding ? spacing.md : 0,
          }}
        >
          {children}
        </ScrollView>
      </WrapperComponent>
    );
  }
  
  return (
    <WrapperComponent style={finalStyle} className={className}>
      {children}
    </WrapperComponent>
  );
}

// Responsive Text Component
interface ResponsiveTextProps {
  children: React.ReactNode;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  color?: string;
  align?: 'left' | 'center' | 'right';
  style?: any;
  className?: string;
  numberOfLines?: number;
}

export function ResponsiveText({
  children,
  size = 'md',
  weight = 'normal',
  color = '#374151',
  align = 'left',
  style,
  className = '',
  numberOfLines,
}: ResponsiveTextProps) {
  const fontSize = fontSizes[size];
  
  const fontWeightMap = {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  };
  
  const textStyle = {
    fontSize,
    fontWeight: fontWeightMap[weight],
    color,
    textAlign: align,
    ...style,
  };
  
  return (
    <Text 
      style={textStyle} 
      className={className}
      numberOfLines={numberOfLines}
    >
      {children}
    </Text>
  );
}

// Responsive Button Component
interface ResponsiveButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  className?: string;
}

export function ResponsiveButton({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  style,
  className = '',
}: ResponsiveButtonProps) {
  const sizeMap = {
    sm: {
      height: isSmallDevice() ? 36 : 40,
      paddingHorizontal: spacing.sm,
      fontSize: fontSizes.sm,
    },
    md: {
      height: isSmallDevice() ? 44 : 48,
      paddingHorizontal: spacing.md,
      fontSize: fontSizes.md,
    },
    lg: {
      height: isSmallDevice() ? 52 : 56,
      paddingHorizontal: spacing.lg,
      fontSize: fontSizes.lg,
    },
  };
  
  const variantMap = {
    primary: {
      backgroundColor: '#3B82F6',
      color: '#FFFFFF',
    },
    secondary: {
      backgroundColor: '#6B7280',
      color: '#FFFFFF',
    },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: '#3B82F6',
      color: '#3B82F6',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: '#3B82F6',
    },
  };
  
  const buttonSize = sizeMap[size];
  const buttonVariant = variantMap[variant];
  
  const buttonStyle: ViewStyle = {
    height: buttonSize.height,
    paddingHorizontal: buttonSize.paddingHorizontal,
    backgroundColor: buttonVariant.backgroundColor,
    borderRadius: borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: disabled ? 0.6 : 1,
    ...buttonVariant,
    ...style,
  };
  
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={buttonStyle}
      className={className}
    >
      {icon && <View style={{ marginRight: spacing.xs }}>{icon}</View>}
      <ResponsiveText
        size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md'}
        weight="medium"
        color={buttonVariant.color}
      >
        {loading ? 'Loading...' : title}
      </ResponsiveText>
    </TouchableOpacity>
  );
}

// Responsive Card Component
interface ResponsiveCardProps {
  children: React.ReactNode;
  padding?: boolean;
  margin?: boolean;
  shadow?: boolean;
  style?: ViewStyle;
  className?: string;
}

export function ResponsiveCard({
  children,
  padding = true,
  margin = true,
  shadow = true,
  style,
  className = '',
}: ResponsiveCardProps) {
  const cardStyle: ViewStyle = {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    ...(padding && { padding: spacing.md }),
    ...(margin && { margin: spacing.sm }),
    ...(shadow && {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    }),
    ...style,
  };
  
  return (
    <View style={cardStyle} className={className}>
      {children}
    </View>
  );
}
