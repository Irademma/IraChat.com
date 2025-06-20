import { useRouter, useSegments } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Animated, Dimensions } from "react-native";
import { PanGestureHandler, State } from "react-native-gesture-handler";

const { width: screenWidth } = Dimensions.get("window");

interface SwipeableTabWrapperProps {
  children: React.ReactNode;
}

const tabRoutes = [
  "/(tabs)",
  "/(tabs)/groups",
  "/(tabs)/updates",
  "/(tabs)/calls",
];

export default function SwipeableTabWrapper({
  children,
}: SwipeableTabWrapperProps) {
  const router = useRouter();
  const segments = useSegments();

  // Simple animation values (no bounce)
  const translateX = useRef(new Animated.Value(0)).current;

  // Get current tab index
  const getCurrentTabIndex = () => {
    const currentSegment = segments[segments.length - 1];
    if (currentSegment === "groups") return 1;
    if (currentSegment === "updates") return 2;
    if (currentSegment === "calls") return 3;
    return 0; // default to chats
  };

  // Swipe gesture handler with strict boundary checking
  const onGestureEvent = (event: any) => {
    const { translationX: tx } = event.nativeEvent;
    const currentIndex = getCurrentTabIndex();

    // Completely prevent swiping beyond boundaries
    if (currentIndex === 0 && tx > 0) {
      // At first tab (chats), completely block right swipe
      translateX.setValue(0);
      return;
    }

    if (currentIndex === tabRoutes.length - 1 && tx < 0) {
      // At last tab (calls/settings), completely block left swipe
      translateX.setValue(0);
      return;
    }

    // For middle tabs, allow normal swipe with limits
    const maxTranslation = screenWidth * 0.3;
    translateX.setValue(
      Math.max(-maxTranslation, Math.min(maxTranslation, tx)),
    );
  };

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.state === State.BEGAN) {
      // No animations to remove bounce effect
    }

    if (
      event.nativeEvent.state === State.END ||
      event.nativeEvent.state === State.CANCELLED
    ) {
      const { translationX, velocityX } = event.nativeEvent;
      const threshold = screenWidth * 0.2; // 20% of screen width
      const currentTabIndex = getCurrentTabIndex();

      let newTabIndex = currentTabIndex;

      // Strict boundary checking for swipe navigation
      if (
        (translationX > threshold || velocityX > 800) &&
        currentTabIndex > 0
      ) {
        // Swipe right - go to previous tab (only if not at first tab)
        newTabIndex = currentTabIndex - 1;
      } else if (
        (translationX < -threshold || velocityX < -800) &&
        currentTabIndex < tabRoutes.length - 1
      ) {
        // Swipe left - go to next tab (only if not at last tab)
        newTabIndex = currentTabIndex + 1;
      }

      // Additional safety check to prevent going beyond boundaries
      if (newTabIndex < 0) newTabIndex = 0;
      if (newTabIndex >= tabRoutes.length) newTabIndex = tabRoutes.length - 1;

      // Reset position immediately without animation
      translateX.setValue(0);

      // Navigate to new tab if changed
      if (newTabIndex !== currentTabIndex) {
        router.push(tabRoutes[newTabIndex] as any);
      }
    }
  };

  // No animations - no bounce effect
  useEffect(() => {
    translateX.setValue(0);
  }, [segments]);

  // Dynamic gesture configuration based on current tab
  const currentIndex = getCurrentTabIndex();
  const gestureConfig = {
    // Disable right swipe on first tab, left swipe on last tab
    activeOffsetX:
      currentIndex === 0
        ? [-20, 0]
        : currentIndex === tabRoutes.length - 1
          ? [0, 20]
          : [-20, 20],
    failOffsetY: [-40, 40],
    shouldCancelWhenOutside: true,
    maxPointers: 1,
  };

  return (
    <PanGestureHandler
      onGestureEvent={onGestureEvent}
      onHandlerStateChange={onHandlerStateChange}
      activeOffsetX={gestureConfig.activeOffsetX as any}
      failOffsetY={gestureConfig.failOffsetY as any}
      shouldCancelWhenOutside={gestureConfig.shouldCancelWhenOutside}
      maxPointers={gestureConfig.maxPointers}
    >
      <Animated.View
        style={{
          flex: 1,
          transform: [{ translateX }],
        }}
      >
        {children}
      </Animated.View>
    </PanGestureHandler>
  );
}

// Simple tab transition hook for programmatic navigation
export const useTabTransition = () => {
  const router = useRouter();
  const segments = useSegments();

  const getCurrentTabIndex = () => {
    const currentSegment = segments[segments.length - 1];
    if (currentSegment === "groups") return 1;
    if (currentSegment === "updates") return 2;
    if (currentSegment === "calls") return 3;
    return 0;
  };

  const navigateToTab = (direction: "next" | "previous" | number) => {
    const currentIndex = getCurrentTabIndex();
    let targetIndex = currentIndex;

    if (typeof direction === "number") {
      targetIndex = Math.max(0, Math.min(tabRoutes.length - 1, direction));
    } else if (direction === "next") {
      targetIndex = Math.min(tabRoutes.length - 1, currentIndex + 1);
    } else if (direction === "previous") {
      targetIndex = Math.max(0, currentIndex - 1);
    }

    if (targetIndex !== currentIndex) {
      router.push(tabRoutes[targetIndex] as any);
    }
  };

  return {
    currentTabIndex: getCurrentTabIndex(),
    navigateToTab,
    canGoNext: getCurrentTabIndex() < tabRoutes.length - 1,
    canGoPrevious: getCurrentTabIndex() > 0,
  };
};
