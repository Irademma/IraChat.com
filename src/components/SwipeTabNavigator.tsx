// Enhanced Swipe Navigation for IraChat Tabs
import React, { useRef, useEffect, useState } from 'react';
import { View, Dimensions, Platform } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedGestureHandler,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { useRouter, useSegments } from 'expo-router';
import { Haptics } from 'expo-haptics';

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

  // Navigate to specific tab
  const navigateToTab = (index: number) => {
    if (index < 0 || index >= TABS.length || index === currentTabIndex || isNavigating) {
      return;
    }

    setIsNavigating(true);
    
    // Haptic feedback
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    // Navigate to new tab
    const targetTab = TABS[index];
    router.push(targetTab.route);

    // Reset navigation state after animation
    setTimeout(() => {
      setIsNavigating(false);
    }, 300);
  };

  // Gesture handler for swipe navigation
  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, context) => {
      context.startX = translateX.value;
    },
    
    onActive: (event, context) => {
      const { translationX } = event;
      const currentIndex = getCurrentTabIndex();
      
      // Calculate boundaries
      const isFirstTab = currentIndex === 0;
      const isLastTab = currentIndex === TABS.length - 1;
      
      // Apply resistance at boundaries
      let newTranslateX = translationX;
      
      if (isFirstTab && translationX > 0) {
        // Resistance when swiping right on first tab
        newTranslateX = translationX * 0.3;
      } else if (isLastTab && translationX < 0) {
        // Resistance when swiping left on last tab
        newTranslateX = translationX * 0.3;
      } else {
        // Normal swipe with slight resistance
        newTranslateX = translationX * 0.8;
      }
      
      // Limit translation to screen width
      const maxTranslation = screenWidth * 0.4;
      translateX.value = Math.max(-maxTranslation, Math.min(maxTranslation, newTranslateX));
      
      // Scale effect during swipe
      const progress = Math.abs(translateX.value) / (screenWidth * 0.3);
      scale.value = 1 - (progress * 0.05); // Subtle scale effect
      opacity.value = 1 - (progress * 0.1); // Subtle opacity effect
    },
    
    onEnd: (event) => {
      const { translationX, velocityX } = event;
      const currentIndex = getCurrentTabIndex();
      
      // Determine if swipe should trigger navigation
      const threshold = screenWidth * 0.25; // 25% of screen width
      const velocityThreshold = 800; // Minimum velocity for quick swipes
      
      let shouldNavigate = false;
      let targetIndex = currentIndex;
      
      // Check swipe direction and conditions
      if (translationX > threshold || velocityX > velocityThreshold) {
        // Swipe right - go to previous tab
        if (currentIndex > 0) {
          shouldNavigate = true;
          targetIndex = currentIndex - 1;
        }
      } else if (translationX < -threshold || velocityX < -velocityThreshold) {
        // Swipe left - go to next tab
        if (currentIndex < TABS.length - 1) {
          shouldNavigate = true;
          targetIndex = currentIndex + 1;
        }
      }
      
      // Animate back to original position
      translateX.value = withSpring(0, {
        damping: 20,
        stiffness: 300,
      });
      
      scale.value = withSpring(1, {
        damping: 20,
        stiffness: 300,
      });
      
      opacity.value = withTiming(1, {
        duration: 200,
      });
      
      // Navigate if conditions are met
      if (shouldNavigate) {
        runOnJS(navigateToTab)(targetIndex);
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

  return (
    <View style={{ flex: 1 }}>
      <PanGestureHandler
        onGestureEvent={gestureHandler}
        activeOffsetX={[-15, 15]} // Minimum horizontal movement to activate
        failOffsetY={[-30, 30]} // Fail if vertical movement is too large
        shouldCancelWhenOutside={true}
        maxPointers={1}
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
