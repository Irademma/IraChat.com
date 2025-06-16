import { Easing, Platform } from "react-native";
import { colors } from "../theme/colors";

// Gradient configurations
export const gradients = {
  primary: ["#87CEEB", "#B0E0E6"],
  secondary: ["#E0F7FA", "#B2EBF2"],
  success: ["#A5D6A7", "#81C784"],
  error: ["#EF9A9A", "#E57373"],
  warning: ["#FFE082", "#FFD54F"],
  info: ["#90CAF9", "#64B5F6"],
};

// Shadow configurations
export const shadows = {
  small: Platform.select({
    ios: {
      shadowColor: colors.border,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
    },
    android: {
      elevation: 2,
    },
  }),
  medium: Platform.select({
    ios: {
      shadowColor: colors.border,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 6,
    },
    android: {
      elevation: 4,
    },
  }),
  large: Platform.select({
    ios: {
      shadowColor: colors.border,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
    },
    android: {
      elevation: 6,
    },
  }),
};

// Blur configurations
export const blurConfig = {
  light: Platform.select({
    ios: {
      blurType: "light",
      blurAmount: 5,
    },
    android: {
      blurRadius: 5,
    },
  }),
  medium: Platform.select({
    ios: {
      blurType: "regular",
      blurAmount: 10,
    },
    android: {
      blurRadius: 10,
    },
  }),
  heavy: Platform.select({
    ios: {
      blurType: "dark",
      blurAmount: 15,
    },
    android: {
      blurRadius: 15,
    },
  }),
};

// Animation configurations
export const animations = {
  timing: {
    fast: 200,
    normal: 300,
    slow: 500,
  },
  easing: {
    easeInOut: Easing.inOut(Easing.ease),
    easeOut: Easing.out(Easing.ease),
    easeIn: Easing.in(Easing.ease),
    bounce: Easing.bounce,
    elastic: Easing.elastic(1),
  },
};

// Transition configurations
export const transitions = {
  fade: {
    from: { opacity: 0 },
    to: { opacity: 1 },
  },
  slideUp: {
    from: { transform: [{ translateY: 100 }], opacity: 0 },
    to: { transform: [{ translateY: 0 }], opacity: 1 },
  },
  slideDown: {
    from: { transform: [{ translateY: -100 }], opacity: 0 },
    to: { transform: [{ translateY: 0 }], opacity: 1 },
  },
  slideLeft: {
    from: { transform: [{ translateX: 100 }], opacity: 0 },
    to: { transform: [{ translateX: 0 }], opacity: 1 },
  },
  slideRight: {
    from: { transform: [{ translateX: -100 }], opacity: 0 },
    to: { transform: [{ translateX: 0 }], opacity: 1 },
  },
  scale: {
    from: { transform: [{ scale: 0.8 }], opacity: 0 },
    to: { transform: [{ scale: 1 }], opacity: 1 },
  },
};

// Haptic feedback configurations
export const hapticFeedback = {
  light: Platform.select({
    ios: "light",
    android: "soft",
  }),
  medium: Platform.select({
    ios: "medium",
    android: "medium",
  }),
  heavy: Platform.select({
    ios: "heavy",
    android: "hard",
  }),
};

// Loading configurations
export const loadingConfig = {
  spinner: {
    size: "large",
    color: colors.primary,
  },
  skeleton: {
    backgroundColor: colors.border,
    highlightColor: colors.surface,
  },
};

// Toast configurations
export const toastConfig = {
  success: {
    backgroundColor: colors.success,
    textColor: colors.background,
    duration: 2000,
  },
  error: {
    backgroundColor: colors.error,
    textColor: colors.background,
    duration: 3000,
  },
  warning: {
    backgroundColor: colors.warning,
    textColor: colors.text,
    duration: 2500,
  },
  info: {
    backgroundColor: colors.info,
    textColor: colors.background,
    duration: 2000,
  },
};

// Modal configurations
export const modalConfig = {
  default: {
    animationType: "slide",
    transparent: true,
    presentationStyle: "overFullScreen",
  },
  bottomSheet: {
    animationType: "slide",
    transparent: true,
    presentationStyle: "overFullScreen",
  },
  alert: {
    animationType: "fade",
    transparent: true,
    presentationStyle: "overFullScreen",
  },
};

// Gesture configurations
export const gestureConfig = {
  swipe: {
    velocityThreshold: 0.3,
    directionalOffsetThreshold: 80,
  },
  pinch: {
    minScale: 0.5,
    maxScale: 3,
  },
  pan: {
    minDistance: 10,
    minVelocity: 0.3,
  },
};

// Ripple configurations
export const rippleConfig = {
  color: colors.primary,
  borderless: false,
  radius: 20,
};

// Focus configurations
export const focusConfig = {
  scale: 1.05,
  duration: 200,
  easing: Easing.out(Easing.ease),
};

// Press configurations
export const pressConfig = {
  scale: 0.95,
  duration: 100,
  easing: Easing.out(Easing.ease),
};

// Scroll configurations
export const scrollConfig = {
  decelerationRate: "normal",
  showsVerticalScrollIndicator: false,
  showsHorizontalScrollIndicator: false,
  bounces: true,
  overScrollMode: "always",
};

// Keyboard configurations
export const keyboardConfig = {
  behavior: Platform.select({
    ios: "padding",
    android: "height",
  }),
  keyboardVerticalOffset: Platform.select({
    ios: 0,
    android: 0,
  }),
};

// Status bar configurations
export const statusBarConfig = {
  backgroundColor: "transparent",
  barStyle: "dark-content",
  translucent: true,
};

// Navigation configurations
export const navigationConfig = {
  headerStyle: {
    backgroundColor: colors.background,
    elevation: 0,
    shadowOpacity: 0,
  },
  headerTintColor: colors.text,
  headerTitleStyle: {
    fontWeight: "600",
  },
  headerBackTitleVisible: false,
};
