// X (Twitter) Style Scroll-Responsive UI Hook
import { useRef, useCallback } from 'react';
import { useSharedValue, withTiming, runOnJS } from 'react-native-reanimated';
import { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

interface ScrollResponsiveConfig {
  threshold?: number; // Minimum scroll distance to trigger hide/show
  animationDuration?: number; // Animation duration in ms
  headerHeight?: number; // Header height for calculations
  tabBarHeight?: number; // Tab bar height for calculations
  enableHaptics?: boolean; // Enable haptic feedback
}

interface ScrollResponsiveReturn {
  headerTranslateY: any; // Reanimated shared value for header
  tabBarTranslateY: any; // Reanimated shared value for tab bar
  onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  isHeaderVisible: boolean;
  isTabBarVisible: boolean;
  showBars: () => void;
  hideBars: () => void;
  resetBars: () => void;
}

export const useScrollResponsive = (config: ScrollResponsiveConfig = {}): ScrollResponsiveReturn => {
  const {
    threshold = 10,
    animationDuration = 250,
    headerHeight = 60,
    tabBarHeight = 80,
    enableHaptics = true,
  } = config;

  // Reanimated shared values for smooth animations
  const headerTranslateY = useSharedValue(0);
  const tabBarTranslateY = useSharedValue(0);

  // Scroll tracking refs
  const lastScrollY = useRef(0);
  const scrollDirection = useRef<'up' | 'down' | null>(null);
  const isHeaderVisible = useRef(true);
  const isTabBarVisible = useRef(true);
  const accumulatedScroll = useRef(0);

  // Haptic feedback (iOS only)
  const triggerHaptic = useCallback(() => {
    if (enableHaptics) {
      try {
        const { Haptics } = require('expo-haptics');
        if (Haptics?.impactAsync) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      } catch (error) {
        // Haptics not available, ignore
      }
    }
  }, [enableHaptics]);

  // Show header and tab bar
  const showBars = useCallback(() => {
    'worklet';
    headerTranslateY.value = withTiming(0, { duration: animationDuration });
    tabBarTranslateY.value = withTiming(0, { duration: animationDuration });
    
    runOnJS(() => {
      isHeaderVisible.current = true;
      isTabBarVisible.current = true;
      if (enableHaptics) {
        triggerHaptic();
      }
    })();
  }, [headerTranslateY, tabBarTranslateY, animationDuration, enableHaptics, triggerHaptic]);

  // Hide header and tab bar
  const hideBars = useCallback(() => {
    'worklet';
    headerTranslateY.value = withTiming(-headerHeight, { duration: animationDuration });
    tabBarTranslateY.value = withTiming(tabBarHeight, { duration: animationDuration });
    
    runOnJS(() => {
      isHeaderVisible.current = false;
      isTabBarVisible.current = false;
      if (enableHaptics) {
        triggerHaptic();
      }
    })();
  }, [headerTranslateY, tabBarTranslateY, headerHeight, tabBarHeight, animationDuration, enableHaptics, triggerHaptic]);

  // Reset bars to visible state
  const resetBars = useCallback(() => {
    'worklet';
    headerTranslateY.value = withTiming(0, { duration: animationDuration });
    tabBarTranslateY.value = withTiming(0, { duration: animationDuration });
    
    runOnJS(() => {
      isHeaderVisible.current = true;
      isTabBarVisible.current = true;
      lastScrollY.current = 0;
      accumulatedScroll.current = 0;
      scrollDirection.current = null;
    })();
  }, [headerTranslateY, tabBarTranslateY, animationDuration]);

  // Main scroll handler with X-style behavior
  const onScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    'worklet';
    const currentScrollY = event.nativeEvent.contentOffset.y;
    const deltaY = currentScrollY - lastScrollY.current;

    // Ignore very small movements to prevent flickering
    if (Math.abs(deltaY) < 1) {
      return;
    }

    // Determine scroll direction
    const currentDirection = deltaY > 0 ? 'up' : 'down';

    // Reset accumulated scroll if direction changed
    if (scrollDirection.current !== currentDirection) {
      accumulatedScroll.current = 0;
      scrollDirection.current = currentDirection;
    }

    // Accumulate scroll distance
    accumulatedScroll.current += Math.abs(deltaY);

    // Only trigger animation if we've scrolled enough (threshold)
    if (accumulatedScroll.current >= threshold) {
      if (currentDirection === 'up' && isHeaderVisible.current) {
        // Scrolling up - hide bars
        hideBars();
      } else if (currentDirection === 'down' && !isHeaderVisible.current) {
        // Scrolling down - show bars
        showBars();
      }

      // Reset accumulated scroll after triggering
      accumulatedScroll.current = 0;
    }

    // Special case: if we're at the top, always show bars
    if (currentScrollY <= 0) {
      if (!isHeaderVisible.current) {
        showBars();
      }
    }

    // Update last scroll position
    runOnJS(() => {
      lastScrollY.current = currentScrollY;
    })();
  }, [threshold, hideBars, showBars]);

  return {
    headerTranslateY,
    tabBarTranslateY,
    onScroll,
    isHeaderVisible: isHeaderVisible.current,
    isTabBarVisible: isTabBarVisible.current,
    showBars,
    hideBars,
    resetBars,
  };
};
