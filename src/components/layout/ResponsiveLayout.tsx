import React from "react";
import { View, ViewStyle, ScrollView, Platform } from "react-native";
import {
  useResponsiveDimensions,
  useResponsiveSpacing,
} from "../../hooks/useResponsiveDimensions";

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  style?: ViewStyle;
  className?: string;
  scrollable?: boolean;
  centered?: boolean;
  maxWidth?: boolean;
  padding?: boolean;
  safeArea?: boolean;
}

export function ResponsiveLayout({
  children,
  style,
  className = "",
  scrollable = false,
  centered = false,
  maxWidth = false,
  padding = true,
  safeArea = true,
}: ResponsiveLayoutProps) {
  const { width, isSmall, isMedium, isDesktop } = useResponsiveDimensions();
  const spacing = useResponsiveSpacing();

  const containerStyle: ViewStyle = {
    flex: 1,
    ...(padding && { padding: spacing.containerPadding }),
    ...(centered && {
      alignItems: "center",
      justifyContent: "center",
    }),
    ...(maxWidth && {
      maxWidth: isSmall ? "100%" : isMedium ? 600 : 800,
      alignSelf: "center",
      width: "100%",
    }),
    ...(safeArea &&
      Platform.OS === "web" && {
        paddingTop: 20, // Add top padding for web
      }),
    ...style,
  };

  const responsiveClassName = [
    className,
    // Add responsive classes based on device type
    isSmall ? "mobile" : "",
    isMedium ? "tablet" : "",
    isDesktop ? "desktop" : "",
  ]
    .filter(Boolean)
    .join(" ");

  if (scrollable) {
    return (
      <ScrollView
        style={containerStyle}
        className={responsiveClassName}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={centered ? { flexGrow: 1 } : undefined}
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
  className = "",
}: ResponsiveGridProps) {
  const { isSmall, isMedium } = useResponsiveDimensions();
  const responsiveSpacing = useResponsiveSpacing();

  const gridColumns = columns || (isSmall ? 1 : isMedium ? 2 : 3);
  const gridSpacing = spacing || responsiveSpacing.itemSpacing;

  const gridStyle: ViewStyle = {
    flexDirection: "row",
    flexWrap: "wrap",
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

// Responsive Card Component
interface ResponsiveCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  className?: string;
  padding?: boolean;
  shadow?: boolean;
}

export function ResponsiveCard({
  children,
  style,
  className = "",
  padding = true,
  shadow = true,
}: ResponsiveCardProps) {
  const { isSmall } = useResponsiveDimensions();
  const spacing = useResponsiveSpacing();

  const shadowProps =
    Platform.OS === "web"
      ? {
          boxShadow: shadow ? "0 2px 8px rgba(0, 0, 0, 0.1)" : "none",
        }
      : ({
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: shadow ? 0.1 : 0,
          shadowRadius: 4,
          elevation: shadow ? 3 : 0,
        } as any);

  const cardStyle: ViewStyle = {
    backgroundColor: "#FFFFFF",
    borderRadius: isSmall ? 12 : 16,
    ...(padding && { padding: spacing.containerPadding }),
    ...shadowProps,
    ...style,
  };

  return (
    <View style={cardStyle} className={className}>
      {children}
    </View>
  );
}

// Responsive Spacing Component
interface ResponsiveSpacingProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "xxl";
  horizontal?: boolean;
  vertical?: boolean;
}

export function ResponsiveSpacing({
  size = "md",
  horizontal = false,
  vertical = true,
}: ResponsiveSpacingProps) {
  const spacing = useResponsiveSpacing();

  const spacingValue = spacing[size];

  return (
    <View
      style={{
        ...(horizontal && { width: spacingValue }),
        ...(vertical && { height: spacingValue }),
      }}
    />
  );
}

// Responsive Container with max width
interface ResponsiveContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  className?: string;
}

export function ResponsiveContainer({
  children,
  style,
  className = "",
}: ResponsiveContainerProps) {
  const { isSmall, isMedium } = useResponsiveDimensions();

  const containerStyle: ViewStyle = {
    width: "100%",
    maxWidth: isSmall ? "100%" : isMedium ? 600 : 800,
    alignSelf: "center",
    ...style,
  };

  return (
    <View style={containerStyle} className={className}>
      {children}
    </View>
  );
}
