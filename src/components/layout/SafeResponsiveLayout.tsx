import React from "react";
import { View, ScrollView, Platform, StatusBar } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  useResponsiveDimensions,
  useResponsiveSpacing,
  useResponsiveLayout,
} from "../../hooks/useResponsiveDimensions";

interface SafeResponsiveLayoutProps {
  children: React.ReactNode;
  centered?: boolean;
  maxWidth?: boolean;
  scrollable?: boolean;
  padding?: boolean;
  safeArea?: boolean;
  backgroundColor?: string;
  style?: any;
}

export function SafeResponsiveLayout({
  children,
  centered = false,
  maxWidth = false,
  scrollable = false,
  padding = true,
  safeArea = true,
  backgroundColor = "white",
  style,
}: SafeResponsiveLayoutProps) {
  const { width, height, isXSmall, deviceType } = useResponsiveDimensions();
  const spacing = useResponsiveSpacing();
  const layout = useResponsiveLayout();
  const insets = useSafeAreaInsets();

  // Calculate safe padding
  const safePadding = {
    paddingTop: safeArea ? Math.max(insets.top, spacing.safeArea) : 0,
    paddingBottom: safeArea ? Math.max(insets.bottom, spacing.safeArea) : 0,
    paddingLeft: safeArea ? Math.max(insets.left, spacing.safeArea) : 0,
    paddingRight: safeArea ? Math.max(insets.right, spacing.safeArea) : 0,
  };

  // Content padding
  const contentPadding = padding
    ? {
        paddingHorizontal: spacing.containerPadding,
        paddingVertical: spacing.sectionSpacing,
      }
    : {};

  // Container styles
  const containerStyle = {
    flex: 1,
    backgroundColor,
    minHeight: height,
    ...safePadding,
    ...style,
  };

  // Content wrapper styles
  const contentStyle = {
    flex: 1,
    width: "100%" as const,
    maxWidth: (maxWidth ? layout.maxContentWidth : "100%") as any,
    alignSelf: (centered ? "center" : "stretch") as "center" | "stretch",
    ...contentPadding,
  };

  // Prevent content overflow on very small devices
  const safeContentStyle = {
    ...contentStyle,
    minWidth: isXSmall ? Math.min(width - 32, 280) : undefined,
    overflow: "hidden" as const,
  };

  if (scrollable) {
    return (
      <View style={containerStyle}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={safeContentStyle}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}
          overScrollMode="never"
          scrollEventThrottle={16}
        >
          {children}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={containerStyle}>
      <View style={safeContentStyle}>{children}</View>
    </View>
  );
}

// Responsive container for specific content types
export function ResponsiveContainer({
  children,
  type = "default",
  style,
}: {
  children: React.ReactNode;
  type?: "default" | "card" | "modal" | "form" | "list";
  style?: any;
}) {
  const { isXSmall, isSmall } = useResponsiveDimensions();
  const spacing = useResponsiveSpacing();
  const layout = useResponsiveLayout();

  const getContainerStyle = () => {
    const baseStyle = {
      width: "100%",
      overflow: "hidden" as const,
    };

    switch (type) {
      case "card":
        return {
          ...baseStyle,
          backgroundColor: "white",
          borderRadius: layout.borderRadius,
          padding: layout.cardPadding,
          margin: layout.cardMargin,
          ...(Platform.OS === "web"
            ? {
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
              }
            : ({
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              } as any)),
        };

      case "modal":
        return {
          ...baseStyle,
          backgroundColor: "white",
          borderRadius: layout.borderRadius,
          padding: spacing.containerPadding,
          maxWidth: layout.modalMaxWidth,
          maxHeight: layout.modalMaxHeight,
          minHeight: layout.modalMinHeight,
          alignSelf: "center" as "center",
        };

      case "form":
        return {
          ...baseStyle,
          padding: spacing.containerPadding,
          gap: spacing.itemSpacing,
        };

      case "list":
        return {
          ...baseStyle,
          paddingHorizontal: isXSmall ? 8 : spacing.containerPadding,
        };

      default:
        return {
          ...baseStyle,
          padding: spacing.containerPadding,
        };
    }
  };

  return <View style={[getContainerStyle(), style]}>{children}</View>;
}

// Responsive grid component
export function ResponsiveGrid({
  children,
  columns,
  spacing: gridSpacing = 16,
  style,
}: {
  children: React.ReactNode;
  columns?: number;
  spacing?: number;
  style?: any;
}) {
  const { isXSmall, isSmall } = useResponsiveDimensions();
  const layout = useResponsiveLayout();

  const effectiveColumns = columns || layout.gridColumns;
  const safeSpacing = isXSmall ? Math.min(gridSpacing, 8) : gridSpacing;

  return (
    <View
      style={[
        {
          flexDirection: "row",
          flexWrap: "wrap",
          marginHorizontal: -safeSpacing / 2,
        },
        style,
      ]}
    >
      {React.Children.map(children, (child, index) => (
        <View
          style={{
            width: `${100 / effectiveColumns}%`,
            paddingHorizontal: safeSpacing / 2,
            marginBottom: safeSpacing,
          }}
        >
          {child}
        </View>
      ))}
    </View>
  );
}

// Responsive spacer component
export function ResponsiveSpacer({
  size = "md",
  horizontal = false,
}: {
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "xxl";
  horizontal?: boolean;
}) {
  const spacing = useResponsiveSpacing();
  const spaceValue = spacing[size];

  return (
    <View
      style={{
        width: horizontal ? spaceValue : undefined,
        height: horizontal ? undefined : spaceValue,
      }}
    />
  );
}

export default SafeResponsiveLayout;
