import React from "react";
import { View, StyleSheet } from "react-native";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

// This is a fallback for web and Android where the tab bar is generally opaque.
export default function TabBarBackground() {
  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        {
          backgroundColor: "#FFFFFF",
        },
      ]}
    />
  );
}

export function useBottomTabOverflow() {
  try {
    return useBottomTabBarHeight();
  } catch (error) {
    // Fallback if not inside a tab navigator - suppress warning for expected behavior
    return 0;
  }
}
