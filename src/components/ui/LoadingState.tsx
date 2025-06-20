import React from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { useResponsiveDimensions } from "../../hooks/useResponsiveDimensions";
import { fontSizes } from "../../utils/responsive";

interface LoadingStateProps {
  message?: string;
  size?: "small" | "large";
  color?: string;
  accessible?: boolean;
}

export default function LoadingState({
  message = "Loading...",
  size = "large",
  color = "#667eea",
  accessible = true,
}: LoadingStateProps) {
  const { isXSmall } = useResponsiveDimensions();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: isXSmall ? 16 : 24,
      }}
      accessible={accessible}
      accessibilityLabel={`Loading screen. ${message}`}
      accessibilityRole="progressbar"
    >
      <ActivityIndicator
        size={size}
        color={color}
        accessible={true}
        accessibilityLabel="Loading indicator"
      />
      <Text
        style={{
          marginTop: 12,
          fontSize: isXSmall ? fontSizes.sm : fontSizes.base,
          color: "#6B7280",
          textAlign: "center",
        }}
        accessible={true}
        accessibilityLabel={message}
      >
        {message}
      </Text>
    </View>
  );
}
