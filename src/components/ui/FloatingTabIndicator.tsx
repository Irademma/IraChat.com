import React, { useRef, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  Animated,
  Dimensions,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTabNavigation } from "../../hooks/useTabNavigation";

const { width: screenWidth } = Dimensions.get("window");

interface FloatingTabIndicatorProps {
  visible?: boolean;
  position?: "top" | "bottom";
  style?: any;
}

export default function FloatingTabIndicator({
  visible = true,
  position = "bottom",
  style,
}: FloatingTabIndicatorProps) {
  const { currentTabIndex, navigateToTab, getTabInfo, tabRoutes } =
    useTabNavigation();
  const fadeAnim = useRef(new Animated.Value(visible ? 1 : 0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const tabInfo = getTabInfo();

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: visible ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  // Animate indicator position when tab changes
  useEffect(() => {
    const indicatorWidth = 60;
    const totalWidth = screenWidth - 40; // Account for margins
    const position =
      (currentTabIndex / (tabRoutes.length - 1)) *
      (totalWidth - indicatorWidth);

    // No animations - set values directly
    slideAnim.setValue(position);
    scaleAnim.setValue(1);
  }, [currentTabIndex]);

  const handleTabPress = (index: number) => {
    navigateToTab(index);
  };

  const getTabIcon = (index: number) => {
    const icons = ["chatbubbles", "people", "radio-button-on", "call"];
    return icons[index] as keyof typeof Ionicons.glyphMap;
  };

  const getTabColor = (index: number) => {
    return index === currentTabIndex ? "#667eea" : "#8E8E93";
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          left: 20,
          right: 20,
          height: 60,
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          borderRadius: 30,
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
          elevation: 8,
          opacity: fadeAnim,
        },
        position === "top" ? { top: 100 } : { bottom: 100 },
        style,
      ]}
    >
      {/* Background indicator */}
      <Animated.View
        style={{
          position: "absolute",
          width: 60,
          height: 44,
          backgroundColor: "#667eea",
          borderRadius: 22,
          opacity: 0.1,
          transform: [{ translateX: slideAnim }, { scale: scaleAnim }],
        }}
      />

      {/* Tab buttons */}
      {tabRoutes.map((tab, index) => (
        <TouchableOpacity
          key={tab.name}
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            height: 44,
            borderRadius: 22,
          }}
          onPress={() => handleTabPress(index)}
          activeOpacity={0.7}
        >
          <Animated.View
            style={{
              alignItems: "center",
              transform: [
                {
                  scale: currentTabIndex === index ? 1.1 : 1,
                },
              ],
            }}
          >
            <Ionicons
              name={getTabIcon(index)}
              size={20}
              color={getTabColor(index)}
            />
            <Text
              style={{
                fontSize: 10,
                fontWeight: "600",
                color: getTabColor(index),
                marginTop: 2,
              }}
            >
              {tab.title}
            </Text>
          </Animated.View>
        </TouchableOpacity>
      ))}

      {/* Current tab indicator dot */}
      <View
        style={{
          position: "absolute",
          top: -4,
          left: 20 + currentTabIndex * ((screenWidth - 56) / 4) + 22,
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: "#667eea",
        }}
      />
    </Animated.View>
  );
}

// Quick tab switcher component - REMOVED
// Navigation icons removed as per user request
