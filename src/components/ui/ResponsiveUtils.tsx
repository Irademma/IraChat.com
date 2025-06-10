import React from 'react';
import { View, ViewStyle, Platform, Dimensions } from 'react-native';
import { useResponsiveDesign, useResponsiveSpacing, useResponsiveLayout } from '../../hooks/useResponsiveDesign';

// Enhanced responsive wrapper for perfect cross-device compatibility
interface ResponsiveWrapperProps {
  children: React.ReactNode;
  style?: ViewStyle;
  className?: string;
  maxWidth?: boolean;
  centered?: boolean;
  padding?: boolean;
  margin?: boolean;
  fullHeight?: boolean;
  safeArea?: boolean;
}

export function ResponsiveWrapper({
  children,
  style,
  className = '',
  maxWidth = false,
  centered = false,
  padding = false,
  margin = false,
  fullHeight = false,
  safeArea = false,
}: ResponsiveWrapperProps) {
  const { breakpoints, deviceType } = useResponsiveDesign();
  const spacing = useResponsiveSpacing();
  const layout = useResponsiveLayout();

  const wrapperStyle: ViewStyle = {
    ...(fullHeight && { flex: 1 }),
    ...(maxWidth && {
      maxWidth: layout.maxContentWidth as any,
      width: '100%',
    }),
    ...(centered && {
      alignSelf: 'center' as 'center',
      alignItems: 'center' as 'center',
    }),
    ...(padding && {
      padding: spacing.containerPadding,
    }),
    ...(margin && {
      margin: spacing.itemSpacing,
    }),
    ...(safeArea && Platform.OS !== 'web' && {
      paddingTop: spacing.safeArea,
      paddingBottom: spacing.safeArea,
    }),
    ...style,
  };

  return (
    <View style={wrapperStyle} className={className}>
      {children}
    </View>
  );
}

// Responsive flex container
interface ResponsiveFlexProps {
  children: React.ReactNode;
  direction?: 'row' | 'column';
  justify?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
  align?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  wrap?: boolean;
  gap?: number;
  style?: ViewStyle;
  className?: string;
}

export function ResponsiveFlex({
  children,
  direction = 'column',
  justify = 'flex-start',
  align = 'stretch',
  wrap = false,
  gap,
  style,
  className = '',
}: ResponsiveFlexProps) {
  const spacing = useResponsiveSpacing();
  const { breakpoints } = useResponsiveDesign();

  const flexStyle: ViewStyle = {
    display: 'flex',
    flexDirection: direction,
    justifyContent: justify,
    alignItems: align,
    ...(wrap && { flexWrap: 'wrap' }),
    ...(gap !== undefined && { gap: gap }),
    ...style,
  };

  return (
    <View style={flexStyle} className={className}>
      {children}
    </View>
  );
}

// Responsive image container
interface ResponsiveImageContainerProps {
  children: React.ReactNode;
  aspectRatio?: number;
  maxWidth?: number | string;
  maxHeight?: number | string;
  style?: ViewStyle;
  className?: string;
}

export function ResponsiveImageContainer({
  children,
  aspectRatio,
  maxWidth,
  maxHeight,
  style,
  className = '',
}: ResponsiveImageContainerProps) {
  const { breakpoints } = useResponsiveDesign();

  const containerStyle: ViewStyle = {
    width: '100%',
    overflow: 'hidden' as 'hidden',
    ...(aspectRatio && { aspectRatio }),
    ...(maxWidth && { maxWidth: maxWidth as any }),
    ...(maxHeight && { maxHeight: maxHeight as any }),
    ...style,
  };

  return (
    <View style={containerStyle} className={className}>
      {children}
    </View>
  );
}

// Responsive breakpoint visibility component
interface ResponsiveShowProps {
  children: React.ReactNode;
  xs?: boolean;
  sm?: boolean;
  md?: boolean;
  lg?: boolean;
  xl?: boolean;
  xxl?: boolean;
  xxxl?: boolean;
  mobile?: boolean;
  tablet?: boolean;
  desktop?: boolean;
}

export function ResponsiveShow({
  children,
  xs = false,
  sm = false,
  md = false,
  lg = false,
  xl = false,
  xxl = false,
  xxxl = false,
  mobile = false,
  tablet = false,
  desktop = false,
}: ResponsiveShowProps) {
  const { breakpoints, deviceType } = useResponsiveDesign();

  const shouldShow = 
    (xs && breakpoints.isXS) ||
    (sm && breakpoints.isSM) ||
    (md && breakpoints.isMD) ||
    (lg && breakpoints.isLG) ||
    (xl && breakpoints.isXL) ||
    (xxl && breakpoints.isXXL) ||
    (xxxl && breakpoints.isXXXL) ||
    (mobile && deviceType === 'mobile') ||
    (tablet && deviceType === 'tablet') ||
    (desktop && deviceType === 'desktop');

  if (!shouldShow) return null;

  return <>{children}</>;
}

// Responsive hide component (opposite of show)
export function ResponsiveHide(props: ResponsiveShowProps) {
  const { breakpoints, deviceType } = useResponsiveDesign();

  const shouldHide = 
    (props.xs && breakpoints.isXS) ||
    (props.sm && breakpoints.isSM) ||
    (props.md && breakpoints.isMD) ||
    (props.lg && breakpoints.isLG) ||
    (props.xl && breakpoints.isXL) ||
    (props.xxl && breakpoints.isXXL) ||
    (props.xxxl && breakpoints.isXXXL) ||
    (props.mobile && deviceType === 'mobile') ||
    (props.tablet && deviceType === 'tablet') ||
    (props.desktop && deviceType === 'desktop');

  if (shouldHide) return null;

  return <>{props.children}</>;
}

// Responsive dimensions hook for components
export function useResponsiveDimensions() {
  const { dimensions, breakpoints, deviceType } = useResponsiveDesign();
  
  return {
    ...dimensions,
    breakpoints,
    deviceType,
    isPortrait: dimensions.height > dimensions.width,
    isLandscape: dimensions.width > dimensions.height,
    // Convenience flags
    isMobile: deviceType === 'mobile',
    isTablet: deviceType === 'tablet',
    isDesktop: deviceType === 'desktop',
    isSmallScreen: breakpoints.isXS || breakpoints.isSM,
    isMediumScreen: breakpoints.isMD || breakpoints.isLG,
    isLargeScreen: breakpoints.isXL || breakpoints.isXXL || breakpoints.isXXXL,
  };
}

// Responsive value selector utility
export function useResponsiveValue<T>(values: {
  xs?: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
  xxl?: T;
  xxxl?: T;
  mobile?: T;
  tablet?: T;
  desktop?: T;
  default?: T;
}): T | undefined {
  const { breakpoints, deviceType } = useResponsiveDesign();

  // Priority: device type > specific breakpoint > default
  if (values[deviceType] !== undefined) {
    return values[deviceType];
  }

  if (breakpoints.isXXXL && values.xxxl !== undefined) return values.xxxl;
  if (breakpoints.isXXL && values.xxl !== undefined) return values.xxl;
  if (breakpoints.isXL && values.xl !== undefined) return values.xl;
  if (breakpoints.isLG && values.lg !== undefined) return values.lg;
  if (breakpoints.isMD && values.md !== undefined) return values.md;
  if (breakpoints.isSM && values.sm !== undefined) return values.sm;
  if (breakpoints.isXS && values.xs !== undefined) return values.xs;

  return values.default;
}

// Responsive safe area component
interface ResponsiveSafeAreaProps {
  children: React.ReactNode;
  top?: boolean;
  bottom?: boolean;
  left?: boolean;
  right?: boolean;
  style?: ViewStyle;
}

export function ResponsiveSafeArea({
  children,
  top = true,
  bottom = true,
  left = true,
  right = true,
  style,
}: ResponsiveSafeAreaProps) {
  const spacing = useResponsiveSpacing();
  const { deviceType } = useResponsiveDesign();

  const safeAreaStyle: ViewStyle = {
    flex: 1,
    ...(top && Platform.OS !== 'web' && { paddingTop: spacing.safeArea }),
    ...(bottom && Platform.OS !== 'web' && { paddingBottom: spacing.safeArea }),
    ...(left && Platform.OS !== 'web' && { paddingLeft: spacing.safeArea }),
    ...(right && Platform.OS !== 'web' && { paddingRight: spacing.safeArea }),
    ...style,
  };

  return (
    <View style={safeAreaStyle}>
      {children}
    </View>
  );
}

// Responsive aspect ratio container
interface ResponsiveAspectRatioProps {
  children: React.ReactNode;
  ratio: number; // width/height ratio (e.g., 16/9 = 1.777)
  maxWidth?: number | string;
  style?: ViewStyle;
}

export function ResponsiveAspectRatio({
  children,
  ratio,
  maxWidth,
  style,
}: ResponsiveAspectRatioProps) {
  const containerStyle: ViewStyle = {
    width: '100%',
    aspectRatio: ratio,
    ...(maxWidth && { maxWidth: maxWidth as any }),
    ...style,
  };

  return (
    <View style={containerStyle}>
      {children}
    </View>
  );
}
