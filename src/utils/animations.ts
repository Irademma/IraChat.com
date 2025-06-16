import { Animated, Easing, Platform } from "react-native";

// Web-compatible animation utilities
export const createWebSafeAnimation = (
  animatedValue: Animated.Value,
  toValue: number,
  duration: number = 300,
  useNativeDriver: boolean = true,
) => {
  return Animated.timing(animatedValue, {
    toValue,
    duration,
    useNativeDriver: Platform.OS !== "web" && useNativeDriver,
  });
};

export const createSpringAnimation = (
  animatedValue: Animated.Value,
  toValue: number,
  useNativeDriver: boolean = true,
) => {
  // No spring animation - use simple timing instead
  return Animated.timing(animatedValue, {
    toValue,
    duration: 200,
    useNativeDriver: Platform.OS !== "web" && useNativeDriver,
  });
};

export const createRotationAnimation = (
  animatedValue: Animated.Value,
  duration: number = 2000,
  useNativeDriver: boolean = true,
) => {
  return Animated.loop(
    Animated.timing(animatedValue, {
      toValue: 1,
      duration,
      useNativeDriver: Platform.OS !== "web" && useNativeDriver,
    }),
  );
};

// Platform-specific animation configurations
export const getAnimationConfig = () => {
  return {
    useNativeDriver: Platform.OS !== "web",
    duration: Platform.OS === "web" ? 200 : 300, // Shorter duration for web
    tension: Platform.OS === "web" ? 120 : 100,
    friction: Platform.OS === "web" ? 10 : 8,
  };
};

// Responsive animation values based on screen size - NO SPRING
export const getResponsiveAnimationValues = (screenWidth: number) => {
  const isSmall = screenWidth < 480;
  const isMedium = screenWidth >= 480 && screenWidth < 768;

  return {
    scale: {
      pressed: 1, // No scale animation
      normal: 1,
    },
    duration: {
      fast: 0, // No animation
      normal: 0, // No animation
      slow: 0, // No animation
    },
    spring: {
      tension: 0, // No spring
      friction: 0, // No spring
    },
  };
};

export const fadeIn = (value: Animated.Value, duration: number = 300) => {
  return Animated.timing(value, {
    toValue: 1,
    duration,
    easing: Easing.ease,
    useNativeDriver: true,
  });
};

export const fadeOut = (value: Animated.Value, duration: number = 300) => {
  return Animated.timing(value, {
    toValue: 0,
    duration,
    easing: Easing.ease,
    useNativeDriver: true,
  });
};

export const slideIn = (value: Animated.Value, duration: number = 300) => {
  return Animated.timing(value, {
    toValue: 0,
    duration,
    easing: Easing.out(Easing.cubic),
    useNativeDriver: true,
  });
};

export const slideOut = (value: Animated.Value, duration: number = 300) => {
  return Animated.timing(value, {
    toValue: 100,
    duration,
    easing: Easing.in(Easing.cubic),
    useNativeDriver: true,
  });
};

export const scaleIn = (value: Animated.Value, duration: number = 300) => {
  return Animated.spring(value, {
    toValue: 1,
    // duration, // Remove unsupported property for spring animation
    useNativeDriver: true,
    friction: 8,
    tension: 40,
  });
};

export const scaleOut = (value: Animated.Value, duration: number = 300) => {
  return Animated.spring(value, {
    toValue: 0,
    // duration, // Remove unsupported property for spring animation
    useNativeDriver: true,
    friction: 8,
    tension: 40,
  });
};

export const shake = (value: Animated.Value) => {
  return Animated.sequence([
    Animated.timing(value, {
      toValue: 10,
      duration: 100,
      useNativeDriver: true,
    }),
    Animated.timing(value, {
      toValue: -10,
      duration: 100,
      useNativeDriver: true,
    }),
    Animated.timing(value, {
      toValue: 10,
      duration: 100,
      useNativeDriver: true,
    }),
    Animated.timing(value, {
      toValue: 0,
      duration: 100,
      useNativeDriver: true,
    }),
  ]);
};

export const pulse = (value: Animated.Value) => {
  return Animated.sequence([
    Animated.timing(value, {
      toValue: 1.1,
      duration: 200,
      useNativeDriver: true,
    }),
    Animated.timing(value, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }),
  ]);
};

export const createPressAnimation = (scale: Animated.Value) => {
  return {
    onPressIn: () => {
      Animated.spring(scale, {
        toValue: 0.95,
        useNativeDriver: true,
        friction: 8,
        tension: 40,
      }).start();
    },
    onPressOut: () => {
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        friction: 8,
        tension: 40,
      }).start();
    },
  };
};

export const createSwipeAnimation = (translateX: Animated.Value) => {
  return {
    onSwipeLeft: () => {
      Animated.timing(translateX, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }).start();
    },
    onSwipeRight: () => {
      Animated.timing(translateX, {
        toValue: 100,
        duration: 300,
        useNativeDriver: true,
      }).start();
    },
    reset: () => {
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true,
        friction: 8,
        tension: 40,
      }).start();
    },
  };
};
