// Visual Swipe Indicator for Tab Navigation
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';

interface SwipeIndicatorProps {
  visible?: boolean;
  direction?: 'left' | 'right' | 'both';
  position?: 'top' | 'bottom' | 'center';
  message?: string;
}

export const SwipeIndicator: React.FC<SwipeIndicatorProps> = ({
  visible = true,
  direction = 'both',
  position = 'bottom',
  message = 'Swipe to navigate between tabs'
}) => {
  const opacity = useSharedValue(0);
  const translateX = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (visible) {
      // Fade in
      opacity.value = withTiming(1, { duration: 500 });
      
      // Gentle swipe animation
      translateX.value = withRepeat(
        withSequence(
          withTiming(-10, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(10, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 1000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );

      // Subtle pulse
      scale.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 1500 }),
          withTiming(1, { duration: 1500 })
        ),
        -1,
        false
      );

      // Auto-hide after 5 seconds
      setTimeout(() => {
        opacity.value = withTiming(0, { duration: 500 });
      }, 5000);
    } else {
      opacity.value = withTiming(0, { duration: 300 });
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [
        { translateX: translateX.value },
        { scale: scale.value }
      ],
    };
  });

  const getPositionStyle = () => {
    switch (position) {
      case 'top':
        return { top: 100 };
      case 'center':
        return { top: '50%' as any, marginTop: -25 };
      case 'bottom':
      default:
        return { bottom: 120 };
    }
  };

  const renderArrows = () => {
    if (direction === 'left') {
      return <Ionicons name="chevron-back" size={20} color="#667eea" />;
    } else if (direction === 'right') {
      return <Ionicons name="chevron-forward" size={20} color="#667eea" />;
    } else {
      return (
        <View style={styles.arrowContainer}>
          <Ionicons name="chevron-back" size={16} color="#667eea" />
          <Ionicons name="chevron-forward" size={16} color="#667eea" />
        </View>
      );
    }
  };

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, getPositionStyle(), animatedStyle]}>
      <View style={styles.indicator}>
        {renderArrows()}
        <Text style={styles.message}>{message}</Text>
      </View>
    </Animated.View>
  );
};

// Hook to show swipe hint for new users
export const useSwipeHint = () => {
  const [showHint, setShowHint] = React.useState(false);
  const hasShownHint = useRef(false);

  useEffect(() => {
    // Show hint for new users (you can integrate with AsyncStorage for persistence)
    if (!hasShownHint.current) {
      setTimeout(() => {
        setShowHint(true);
        hasShownHint.current = true;
      }, 2000); // Show after 2 seconds
    }
  }, []);

  const hideHint = () => {
    setShowHint(false);
  };

  return { showHint, hideHint };
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
    pointerEvents: 'none',
  },
  indicator: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(102, 126, 234, 0.2)',
  },
  arrowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  message: {
    fontSize: 12,
    color: '#667eea',
    fontWeight: '600',
    marginLeft: 4,
  },
});

// Quick Swipe Tutorial Component
export const SwipeTutorial: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [step, setStep] = React.useState(0);
  
  const steps = [
    { direction: 'right' as const, message: 'Swipe left to go to Groups' },
    { direction: 'left' as const, message: 'Swipe right to go back to Chats' },
    { direction: 'both' as const, message: 'Swipe between any tabs!' },
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      if (step < steps.length - 1) {
        setStep(step + 1);
      } else {
        setTimeout(onComplete, 2000);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [step]);

  return (
    <SwipeIndicator
      visible={true}
      direction={steps[step].direction}
      message={steps[step].message}
      position="center"
    />
  );
};
