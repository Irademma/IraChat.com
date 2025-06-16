import { useCallback, useRef, useState } from "react";
import { Animated } from "react-native";

interface UseDoubleTapProps {
  onDoubleTap: () => void;
  onSingleTap?: () => void;
  delay?: number;
}

export const useDoubleTap = (
  onDoubleTap: () => void,
  onSingleTap?: () => void,
  delay: number = 300,
) => {
  const [lastTap, setLastTap] = useState<number | null>(null);
  const likeAnimation = useRef(new Animated.Value(0)).current;

  const handleTap = useCallback(() => {
    const now = Date.now();
    if (lastTap && now - lastTap < delay) {
      // Double tap detected
      onDoubleTap();
      animateLike();
      setLastTap(null);
    } else {
      // Single tap
      setLastTap(now);
      if (onSingleTap) {
        onSingleTap();
      }
    }
  }, [lastTap, delay, onDoubleTap, onSingleTap]);

  const animateLike = () => {
    likeAnimation.setValue(0);
    Animated.sequence([
      Animated.timing(likeAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(likeAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return {
    onPress: handleTap,
    likeAnimation,
  };
};
