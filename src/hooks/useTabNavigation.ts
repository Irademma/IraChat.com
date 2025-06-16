import * as Haptics from "expo-haptics";
import { useRouter, useSegments } from "expo-router";
import { useRef } from "react";
import { Animated, Platform } from "react-native";

interface TabNavigationConfig {
  enableHaptics?: boolean;
  animationDuration?: number;
  enableAutoSwipe?: boolean;
  swipeThreshold?: number;
}

const defaultConfig: TabNavigationConfig = {
  enableHaptics: true,
  animationDuration: 300,
  enableAutoSwipe: true,
  swipeThreshold: 0.2,
};

export const useTabNavigation = (config: TabNavigationConfig = {}) => {
  const router = useRouter();
  const segments = useSegments();
  const finalConfig = { ...defaultConfig, ...config };

  // Simple animation values
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const tabRoutes = [
    { name: "chats", route: "/(tabs)", title: "Chats" },
    { name: "groups", route: "/(tabs)/groups", title: "Groups" },
    { name: "updates", route: "/(tabs)/updates", title: "Updates" },
    { name: "calls", route: "/(tabs)/calls", title: "Calls" },
  ];

  // Get current tab index
  const getCurrentTabIndex = (): number => {
    const currentSegment = segments[segments.length - 1];
    switch (currentSegment) {
      case "groups":
        return 1;
      case "updates":
        return 2;
      case "calls":
        return 3;
      default:
        return 0; // chats
    }
  };

  // Navigate to specific tab with animation
  const navigateToTab = (targetIndex: number, animated: boolean = true) => {
    const currentIndex = getCurrentTabIndex();

    if (
      targetIndex === currentIndex ||
      targetIndex < 0 ||
      targetIndex >= tabRoutes.length
    ) {
      return false;
    }

    // Haptic feedback
    if (finalConfig.enableHaptics && Platform.OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    if (animated) {
      // No animation - set values directly
      fadeAnim.setValue(1);
      scaleAnim.setValue(1);

      // Navigate with slight delay for smooth animation
      setTimeout(() => {
        router.push(tabRoutes[targetIndex].route as any);
      }, finalConfig.animationDuration! / 4);
    } else {
      router.push(tabRoutes[targetIndex].route as any);
    }

    return true;
  };

  // Navigate to next tab
  const navigateNext = (animated: boolean = true) => {
    const currentIndex = getCurrentTabIndex();
    return navigateToTab(currentIndex + 1, animated);
  };

  // Navigate to previous tab
  const navigatePrevious = (animated: boolean = true) => {
    const currentIndex = getCurrentTabIndex();
    return navigateToTab(currentIndex - 1, animated);
  };

  // Auto-swipe functionality (can be triggered by gestures or timers)
  const startAutoSwipe = (
    interval: number = 3000,
    direction: "forward" | "backward" = "forward",
  ) => {
    const autoSwipeInterval = setInterval(() => {
      const currentIndex = getCurrentTabIndex();
      let nextIndex: number;

      if (direction === "forward") {
        nextIndex = currentIndex + 1;
        if (nextIndex >= tabRoutes.length) {
          nextIndex = 0; // Loop back to first tab
        }
      } else {
        nextIndex = currentIndex - 1;
        if (nextIndex < 0) {
          nextIndex = tabRoutes.length - 1; // Loop to last tab
        }
      }

      navigateToTab(nextIndex, true);
    }, interval);

    return () => clearInterval(autoSwipeInterval);
  };

  // Get tab information
  const getTabInfo = () => {
    const currentIndex = getCurrentTabIndex();
    return {
      currentIndex,
      currentTab: tabRoutes[currentIndex],
      totalTabs: tabRoutes.length,
      canGoNext: currentIndex < tabRoutes.length - 1,
      canGoPrevious: currentIndex > 0,
      isFirstTab: currentIndex === 0,
      isLastTab: currentIndex === tabRoutes.length - 1,
    };
  };

  // Gesture-based navigation
  const handleSwipeGesture = (
    direction: "left" | "right",
    velocity?: number,
  ) => {
    const minVelocity = 500; // Minimum velocity for quick swipes
    const isQuickSwipe = velocity && Math.abs(velocity) > minVelocity;

    if (direction === "left") {
      // Swipe left = next tab
      return navigateNext(true);
    } else if (direction === "right") {
      // Swipe right = previous tab
      return navigatePrevious(true);
    }

    return false;
  };

  // Keyboard navigation support
  const handleKeyPress = (key: string) => {
    switch (key) {
      case "ArrowLeft":
        return navigatePrevious();
      case "ArrowRight":
        return navigateNext();
      case "1":
        return navigateToTab(0);
      case "2":
        return navigateToTab(1);
      case "3":
        return navigateToTab(2);
      case "4":
        return navigateToTab(3);
      default:
        return false;
    }
  };

  return {
    // Navigation functions
    navigateToTab,
    navigateNext,
    navigatePrevious,
    handleSwipeGesture,
    handleKeyPress,

    // Auto-swipe
    startAutoSwipe,

    // Tab information
    getTabInfo,
    tabRoutes,

    // Animation values (for custom animations)
    fadeAnim,
    scaleAnim,

    // Current state
    currentTabIndex: getCurrentTabIndex(),
    currentTab: tabRoutes[getCurrentTabIndex()],
  };
};

// Tab transition presets
export const TabTransitionPresets = {
  // Smooth fade transition
  fade: {
    duration: 250,
    animation: "fade",
  },

  // No spring transition
  spring: {
    duration: 0,
    animation: "none",
  },

  // Quick fade transition
  slide: {
    duration: 200,
    animation: "slide",
  },

  // Smooth scale transition
  scale: {
    duration: 350,
    animation: "scale",
  },
};

// Export types
export type TabNavigationHook = ReturnType<typeof useTabNavigation>;
export type TabRoute = {
  name: string;
  route: string;
  title: string;
};
