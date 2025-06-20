import { Ionicons } from "@expo/vector-icons";
import { useRouter, useSegments } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { PanGestureHandler, State } from "react-native-gesture-handler";

const { width: screenWidth } = Dimensions.get("window");

interface TabConfig {
  name: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
}

const tabs: TabConfig[] = [
  { name: "chats", title: "Chats", icon: "chatbubbles", route: "/(tabs)" },
  { name: "groups", title: "Groups", icon: "people", route: "/(tabs)/groups" },
  {
    name: "updates",
    title: "Updates",
    icon: "radio-button-on",
    route: "/(tabs)/updates",
  },
  { name: "calls", title: "Calls", icon: "call", route: "/(tabs)/calls" },
];

interface AnimatedTabNavigatorProps {
  children: React.ReactNode;
  currentTab?: string;
}

export default function AnimatedTabNavigator({
  children,
  currentTab,
}: AnimatedTabNavigatorProps) {
  const router = useRouter();
  const segments = useSegments();

  // Animation values
  const translateX = useRef(new Animated.Value(0)).current;
  const tabIndicatorPosition = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // State
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Determine current tab from route
  useEffect(() => {
    const currentSegment = segments[segments.length - 1];
    let tabIndex = 0;

    if (currentSegment === "groups") tabIndex = 1;
    else if (currentSegment === "updates") tabIndex = 2;
    else if (currentSegment === "calls") tabIndex = 3;

    setActiveTabIndex(tabIndex);

    // No animation - set position directly
    tabIndicatorPosition.setValue(tabIndex * (screenWidth / 4));
  }, [segments]);

  // Swipe gesture handler
  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { useNativeDriver: true },
  );

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.state === State.END) {
      const { translationX, velocityX } = event.nativeEvent;
      const threshold = screenWidth * 0.25;

      let newTabIndex = activeTabIndex;

      // Determine swipe direction and distance
      if (translationX > threshold || velocityX > 500) {
        // Swipe right - go to previous tab
        newTabIndex = Math.max(0, activeTabIndex - 1);
      } else if (translationX < -threshold || velocityX < -500) {
        // Swipe left - go to next tab
        newTabIndex = Math.min(tabs.length - 1, activeTabIndex + 1);
      }

      // Reset translation immediately
      translateX.setValue(0);

      // Navigate to new tab if changed
      if (newTabIndex !== activeTabIndex) {
        navigateToTab(newTabIndex);
      }
    }
  };

  const navigateToTab = (tabIndex: number) => {
    if (isTransitioning || tabIndex === activeTabIndex) return;

    setIsTransitioning(true);

    // Fade out animation
    Animated.timing(fadeAnim, {
      toValue: 0.3,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      // Navigate to new tab
      router.push(tabs[tabIndex].route as any);

      // Fade in animation
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setIsTransitioning(false);
      });
    });
  };

  const renderTabBar = () => (
    <View
      style={{
        flexDirection: "row",
        backgroundColor: "#FFFFFF",
        borderTopWidth: 1,
        borderTopColor: "#E5E7EB",
        paddingBottom: Platform.OS === "ios" ? 20 : 5,
        height: Platform.OS === "ios" ? 85 : 65,
        position: "relative",
      }}
    >
      {/* Animated tab indicator */}
      <Animated.View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: screenWidth / 4,
          height: 3,
          backgroundColor: "#667eea",
          transform: [{ translateX: tabIndicatorPosition }],
        }}
      />

      {tabs.map((tab, index) => (
        <TouchableOpacity
          key={tab.name}
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingTop: 8,
          }}
          onPress={() => navigateToTab(index)}
          activeOpacity={0.7}
        >
          <Animated.View
            style={{
              alignItems: "center",
              transform: [
                {
                  scale: activeTabIndex === index ? 1.1 : 1,
                },
              ],
            }}
          >
            <Ionicons
              name={tab.icon}
              size={24}
              color={activeTabIndex === index ? "#667eea" : "#8E8E93"}
            />
            <Text
              style={{
                fontSize: 11,
                fontWeight: "600",
                color: activeTabIndex === index ? "#667eea" : "#8E8E93",
                marginTop: 4,
              }}
            >
              {tab.title}
            </Text>
          </Animated.View>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
        activeOffsetX={[-10, 10]}
        failOffsetY={[-50, 50]}
      >
        <Animated.View
          style={{
            flex: 1,
            opacity: fadeAnim,
            transform: [{ translateX }],
          }}
        >
          {children}
        </Animated.View>
      </PanGestureHandler>

      {renderTabBar()}
    </View>
  );
}
