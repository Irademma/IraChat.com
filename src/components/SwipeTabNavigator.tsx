// Enhanced Swipe Navigation for IraChat Tabs
import { Haptics } from 'expo-haptics';
import { useRouter, useSegments } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Dimensions, Platform, View } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, {
    runOnJS,
    useAnimatedGestureHandler,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';

const { width: screenWidth } = Dimensions.get('window');

// Tab configuration for IraChat
const TABS = [
  { name: 'chats', route: '/(tabs)', title: 'Chats' },
  { name: 'groups', route: '/(tabs)/groups', title: 'Groups' },
  { name: 'updates', route: '/(tabs)/updates', title: 'Updates' },
  { name: 'calls', route: '/(tabs)/calls', title: 'Calls' },
  { name: 'profile', route: '/(tabs)/profile', title: 'Profile' },
];

interface SwipeTabNavigatorProps {
  children: React.ReactNode;
}

export const SwipeTabNavigator: React.FC<SwipeTabNavigatorProps> = ({ children }) => {
  const router = useRouter();
  const segments = useSegments();
  
  // Animation values
  const translateX = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  
  // State
  const [currentTabIndex, setCurrentTabIndex] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);

  // Get current tab index from route
  const getCurrentTabIndex = (): number => {
    const currentSegment = segments[segments.length - 1];
    
    switch (currentSegment) {
      case 'groups': return 1;
      case 'updates': return 2;
      case 'calls': return 3;
      case 'profile': return 4;
      default: return 0; // chats/index
    }
  };

  // Update current tab index when route changes
  useEffect(() => {
    const newIndex = getCurrentTabIndex();
    setCurrentTabIndex(newIndex);
  }, [segments]);

  // Navigate to specific tab with error handling and boundary checks
  const navigateToTab = (index: number) => {
    try {
      console.log(`🔄 [SWIPE] navigateToTab called with index: ${index}`);
      console.log(`🔄 [SWIPE] Current tab index: ${currentTabIndex}`);
      console.log(`🔄 [SWIPE] Is navigating: ${isNavigating}`);

      // STRICT validation to prevent crashes
      if (typeof index !== 'number' || isNaN(index)) {
        console.log(`❌ [SWIPE] Invalid index type: ${typeof index}`);
        return;
      }

      if (index < 0 || index >= TABS.length) {
        console.log(`❌ [SWIPE] Index out of bounds: ${index} (valid: 0-${TABS.length - 1})`);
        return;
      }

      if (index === currentTabIndex) {
        console.log(`⚠️ [SWIPE] Already on target tab: ${index}`);
        return;
      }

      if (isNavigating) {
        console.log(`⚠️ [SWIPE] Navigation in progress - blocking new navigation`);
        return;
      }

      // Additional boundary checks
      if (currentTabIndex === 0 && index < currentTabIndex) {
        console.log(`🚫 [SWIPE] Blocked: Cannot go before first tab (Chats)`);
        return;
      }

      if (currentTabIndex === TABS.length - 1 && index > currentTabIndex) {
        console.log(`🚫 [SWIPE] Blocked: Cannot go after last tab (Profile)`);
        return;
      }

      console.log(`✅ [SWIPE] Starting safe navigation...`);
      setIsNavigating(true);

      // Haptic feedback
      if (Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      // Navigate to new tab with error handling
      const targetTab = TABS[index];
      if (!targetTab) {
        console.log(`❌ [SWIPE] Target tab not found for index: ${index}`);
        setIsNavigating(false);
        return;
      }

      console.log(`🔄 [SWIPE] Navigating to: ${targetTab.name} (${targetTab.route})`);
      router.push(targetTab.route);

      // Reset navigation state after animation
      setTimeout(() => {
        setIsNavigating(false);
        console.log(`✅ [SWIPE] Navigation complete`);
      }, 300);

    } catch (error) {
      console.error(`❌ [SWIPE] Navigation error:`, error);
      setIsNavigating(false);
      // Don't crash the app - just log the error
    }
  };

  // Ultra-simple gesture handler for reliable swiping
  const gestureHandler = useAnimatedGestureHandler({
    onStart: () => {
      // Just track that gesture started
    },

    onActive: (event) => {
      const { translationX } = event;
      const currentIndex = getCurrentTabIndex();

      // STRICT BOUNDARY ENFORCEMENT - Prevent crashes and unwanted navigation
      // Block right swipe on first tab (Chats)
      if (currentIndex === 0 && translationX > 0) {
        translateX.value = 0; // No movement allowed
        return;
      }

      // Block left swipe on last tab (Profile)
      if (currentIndex === TABS.length - 1 && translationX < 0) {
        translateX.value = 0; // No movement allowed
        return;
      }

      // For middle tabs, allow minimal visual feedback with heavy resistance
      if (Math.abs(translationX) > 30) {
        const resistance = 0.2; // Heavy resistance to prevent crashes
        const maxTranslation = 50; // Very limited movement
        translateX.value = Math.max(-maxTranslation, Math.min(maxTranslation, translationX * resistance));
      }
    },

    onEnd: (event) => {
      const { translationX, velocityX } = event;
      const currentIndex = getCurrentTabIndex();

      // Always reset visual state first to prevent crashes
      translateX.value = withSpring(0, { damping: 25, stiffness: 400 });
      scale.value = withSpring(1, { damping: 25, stiffness: 400 });
      opacity.value = withTiming(1, { duration: 150 });

      // STRICT BOUNDARY CHECKS BEFORE NAVIGATION
      const threshold = 80;
      const velocityThreshold = 600;
      const isStrongGesture = Math.abs(translationX) > threshold || Math.abs(velocityX) > velocityThreshold;

      runOnJS(() => {
        console.log(`🔄 [SWIPE] Gesture ended - currentIndex: ${currentIndex}, translationX: ${translationX}, velocityX: ${velocityX}`);
        console.log(`🔄 [SWIPE] Strong gesture: ${isStrongGesture}, threshold: ${threshold}`);
      })();

      if (!isStrongGesture) {
        runOnJS(() => {
          console.log(`⚠️ [SWIPE] Gesture too weak - no navigation`);
        })();
        return;
      }

      // Navigation with STRICT boundary enforcement
      if (translationX > 0) {
        // Swipe right - go to previous tab
        if (currentIndex > 0) {
          runOnJS(() => {
            console.log(`✅ [SWIPE] Swiping RIGHT - going to previous tab (${currentIndex - 1})`);
          })();
          runOnJS(navigateToTab)(currentIndex - 1);
        } else {
          runOnJS(() => {
            console.log(`🚫 [SWIPE] RIGHT swipe BLOCKED - already at first tab (Chats)`);
          })();
        }
      } else if (translationX < 0) {
        // Swipe left - go to next tab
        if (currentIndex < TABS.length - 1) {
          runOnJS(() => {
            console.log(`✅ [SWIPE] Swiping LEFT - going to next tab (${currentIndex + 1})`);
          })();
          runOnJS(navigateToTab)(currentIndex + 1);
        } else {
          runOnJS(() => {
            console.log(`🚫 [SWIPE] LEFT swipe BLOCKED - already at last tab (Profile)`);
          })();
        }
      }
    },
  });

  // Animated styles
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { scale: scale.value },
      ],
      opacity: opacity.value,
    };
  });

  // Dynamic gesture configuration based on current tab to prevent boundary issues
  const currentIndex = getCurrentTabIndex();
  const gestureConfig = {
    // Disable right swipe on first tab (Chats), left swipe on last tab (Profile)
    activeOffsetX:
      currentIndex === 0
        ? [-40, 0]  // Only allow left swipe on Chats tab
        : currentIndex === TABS.length - 1
          ? [0, 40]  // Only allow right swipe on Profile tab
          : [-40, 40], // Allow both directions on middle tabs
    failOffsetY: [-80, 80], // More restrictive vertical threshold
    shouldCancelWhenOutside: true,
    maxPointers: 1,
    enabled: true,
  };

  return (
    <View style={{ flex: 1 }}>
      <PanGestureHandler
        onGestureEvent={gestureHandler}
        activeOffsetX={gestureConfig.activeOffsetX as any}
        failOffsetY={gestureConfig.failOffsetY as any}
        shouldCancelWhenOutside={gestureConfig.shouldCancelWhenOutside}
        maxPointers={gestureConfig.maxPointers}
        enabled={gestureConfig.enabled}
        simultaneousHandlers={[]} // Prevent conflicts with other gestures
      >
        <Animated.View style={[{ flex: 1 }, animatedStyle]}>
          {children}
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
};

// Hook for programmatic tab navigation
export const useSwipeNavigation = () => {
  const router = useRouter();
  const segments = useSegments();

  const getCurrentTabIndex = (): number => {
    const currentSegment = segments[segments.length - 1];
    
    switch (currentSegment) {
      case 'groups': return 1;
      case 'updates': return 2;
      case 'calls': return 3;
      case 'profile': return 4;
      default: return 0;
    }
  };

  const navigateToTab = (index: number) => {
    if (index < 0 || index >= TABS.length) return;
    
    const targetTab = TABS[index];
    router.push(targetTab.route);
  };

  const navigateNext = () => {
    const currentIndex = getCurrentTabIndex();
    if (currentIndex < TABS.length - 1) {
      navigateToTab(currentIndex + 1);
    }
  };

  const navigatePrevious = () => {
    const currentIndex = getCurrentTabIndex();
    if (currentIndex > 0) {
      navigateToTab(currentIndex - 1);
    }
  };

  return {
    currentTabIndex: getCurrentTabIndex(),
    navigateToTab,
    navigateNext,
    navigatePrevious,
    tabs: TABS,
  };
};
