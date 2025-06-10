import React from 'react';
import { View, ViewStyle, ScrollView, Text, Modal, TouchableOpacity } from 'react-native';
import { useResponsiveDesign, useResponsiveSpacing, useResponsiveLayout, useResponsiveFontSizes } from '../../hooks/useResponsiveDesign';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  className?: string;
  scrollable?: boolean;
  centered?: boolean;
  maxWidth?: boolean;
  padding?: boolean;
}

export function ResponsiveContainer({
  children,
  style,
  className = '',
  scrollable = false,
  centered = false,
  maxWidth = false,
  padding = true,
}: ResponsiveContainerProps) {
  const { breakpoints, deviceType } = useResponsiveDesign();
  const spacing = useResponsiveSpacing();
  const layout = useResponsiveLayout();

  const containerStyle: ViewStyle = {
    flex: 1,
    ...(padding && { padding: spacing.containerPadding }),
    ...(centered && {
      alignItems: 'center',
      justifyContent: 'center',
    }),
    ...(maxWidth && {
      maxWidth: layout.maxContentWidth as any,
      alignSelf: 'center' as 'center',
      width: '100%',
    }),
    ...style,
  };

  const responsiveClassName = [
    className,
    // Add responsive classes based on device type
    deviceType === 'mobile' ? 'mobile' : '',
    deviceType === 'tablet' ? 'tablet' : '',
    deviceType === 'desktop' ? 'desktop' : '',
    breakpoints.isSmall ? 'small' : '',
    breakpoints.isMedium ? 'medium' : '',
    breakpoints.isLarge ? 'large' : '',
  ].filter(Boolean).join(' ');

  if (scrollable) {
    return (
      <ScrollView
        style={containerStyle}
        className={responsiveClassName}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bounces={false}
        overScrollMode="never"
        scrollEventThrottle={16}
      >
        {children}
      </ScrollView>
    );
  }

  return (
    <View style={containerStyle} className={responsiveClassName}>
      {children}
    </View>
  );
}

// Responsive Grid Component
interface ResponsiveGridProps {
  children: React.ReactNode;
  columns?: number;
  spacing?: number;
  style?: ViewStyle;
  className?: string;
}

export function ResponsiveGrid({
  children,
  columns,
  spacing,
  style,
  className = '',
}: ResponsiveGridProps) {
  const { breakpoints } = useResponsiveDesign();
  const responsiveSpacing = useResponsiveSpacing();
  const layout = useResponsiveLayout();

  const gridColumns = columns || layout.gridColumns;
  const gridSpacing = spacing || responsiveSpacing.itemSpacing;

  const gridStyle: ViewStyle = {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -gridSpacing / 2,
    ...style,
  };

  const childrenArray = React.Children.toArray(children);

  return (
    <View style={gridStyle} className={className}>
      {childrenArray.map((child, index) => (
        <View
          key={index}
          style={{
            width: `${100 / gridColumns}%`,
            paddingHorizontal: gridSpacing / 2,
            marginBottom: gridSpacing,
          }}
        >
          {child}
        </View>
      ))}
    </View>
  );
}

// Responsive Text Component
interface ResponsiveTextProps {
  children: React.ReactNode;
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  style?: any;
  className?: string;
  numberOfLines?: number;
}

export function ResponsiveText({
  children,
  size = 'base',
  weight = 'normal',
  style,
  className = '',
  numberOfLines,
}: ResponsiveTextProps) {
  const fontSizes = useResponsiveFontSizes();

  const fontWeightMap = {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  };

  const textStyle = {
    fontSize: fontSizes[size],
    fontWeight: fontWeightMap[weight],
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

// Responsive Spacing Component
interface ResponsiveSpacingProps {
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl';
  horizontal?: boolean;
  vertical?: boolean;
}

export function ResponsiveSpacing({
  size = 'base',
  horizontal = false,
  vertical = true,
}: ResponsiveSpacingProps) {
  const spacing = useResponsiveSpacing();

  const sizeMap = {
    xs: spacing.itemSpacing * 0.5,
    sm: spacing.itemSpacing * 0.75,
    base: spacing.itemSpacing,
    lg: spacing.itemSpacing * 1.5,
    xl: spacing.itemSpacing * 2,
  };

  const spacingValue = sizeMap[size];

  return (
    <View
      style={{
        ...(horizontal && { width: spacingValue }),
        ...(vertical && { height: spacingValue }),
      }}
    />
  );
}

// Responsive Modal Component
interface ResponsiveModalProps {
  children: React.ReactNode;
  visible: boolean;
  onClose: () => void;
  title?: string;
  style?: ViewStyle;
  className?: string;
}

export function ResponsiveModal({
  children,
  visible,
  onClose,
  title,
  style,
  className = '',
}: ResponsiveModalProps) {
  const { breakpoints } = useResponsiveDesign();
  const layout = useResponsiveLayout();
  const spacing = useResponsiveSpacing();

  const modalStyle: ViewStyle = {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  };

  const contentStyle: ViewStyle = {
    width: layout.modalWidth as any,
    maxWidth: layout.modalMaxWidth as any,
    backgroundColor: 'white',
    borderRadius: breakpoints.isSmall ? 12 : 16,
    padding: spacing.containerPadding,
    maxHeight: '80%',
    ...style,
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={modalStyle}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          style={contentStyle}
          className={className}
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          {title && (
            <ResponsiveText size="lg" weight="bold" style={{ marginBottom: spacing.sectionSpacing }}>
              {title}
            </ResponsiveText>
          )}
          {children}
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}
