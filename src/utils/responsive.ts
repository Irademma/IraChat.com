import { Dimensions, Platform, StatusBar } from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Get the actual screen height excluding status bar
const getActualHeight = () => {
  if (Platform.OS === "ios") {
    return SCREEN_HEIGHT;
  }
  return SCREEN_HEIGHT - (StatusBar.currentHeight || 0);
};

// Enhanced device type detection for all mobile devices
export const isTablet = () => {
  const { width, height } = Dimensions.get("window");
  const aspectRatio = height / width;
  const minDimension = Math.min(width, height);
  // More accurate tablet detection
  return minDimension >= 768 || aspectRatio <= 1.6;
};

// Comprehensive mobile device detection
export const isVerySmallDevice = () => {
  return SCREEN_WIDTH < 320; // iPhone SE 1st gen and smaller
};

export const isSmallDevice = () => {
  return SCREEN_WIDTH >= 320 && SCREEN_WIDTH < 375; // iPhone SE 2nd gen, small Android
};

export const isMediumDevice = () => {
  return SCREEN_WIDTH >= 375 && SCREEN_WIDTH < 414; // iPhone 8, iPhone X/11/12/13 mini
};

export const isLargeDevice = () => {
  return SCREEN_WIDTH >= 414 && SCREEN_WIDTH < 768; // iPhone Plus, Pro, large Android phones
};

export const isExtraLargeDevice = () => {
  return SCREEN_WIDTH >= 768; // Tablets and larger
};

// Device category helpers
export const isMobilePhone = () => {
  return SCREEN_WIDTH < 768;
};

export const isCompactDevice = () => {
  return SCREEN_WIDTH < 414; // Small to medium phones
};

// Responsive dimensions
export const wp = (percentage: number) => {
  return (SCREEN_WIDTH * percentage) / 100;
};

export const hp = (percentage: number) => {
  return (SCREEN_HEIGHT * percentage) / 100;
};

// Enhanced responsive font sizes for all mobile devices
export const fontSizes = {
  xxs: isVerySmallDevice()
    ? 8
    : isSmallDevice()
      ? 9
      : isCompactDevice()
        ? 10
        : 11,
  xs: isVerySmallDevice()
    ? 10
    : isSmallDevice()
      ? 11
      : isCompactDevice()
        ? 12
        : 13,
  sm: isVerySmallDevice()
    ? 12
    : isSmallDevice()
      ? 13
      : isCompactDevice()
        ? 14
        : 15,
  base: isVerySmallDevice()
    ? 14
    : isSmallDevice()
      ? 15
      : isCompactDevice()
        ? 16
        : 17, // Add base property
  md: isVerySmallDevice()
    ? 14
    : isSmallDevice()
      ? 15
      : isCompactDevice()
        ? 16
        : 17,
  lg: isVerySmallDevice()
    ? 16
    : isSmallDevice()
      ? 17
      : isCompactDevice()
        ? 18
        : 19,
  xl: isVerySmallDevice()
    ? 18
    : isSmallDevice()
      ? 19
      : isCompactDevice()
        ? 20
        : 21,
  xxl: isVerySmallDevice()
    ? 20
    : isSmallDevice()
      ? 22
      : isCompactDevice()
        ? 24
        : 26,
  xxxl: isVerySmallDevice()
    ? 24
    : isSmallDevice()
      ? 26
      : isCompactDevice()
        ? 28
        : 30,
};

// Export fontSize as alias for compatibility
export const fontSize = fontSizes;

// Responsive spacing
export const spacing = {
  xs: isSmallDevice() ? 4 : 6,
  sm: isSmallDevice() ? 8 : 12,
  md: isSmallDevice() ? 12 : 16,
  lg: isSmallDevice() ? 16 : 24,
  xl: isSmallDevice() ? 24 : 32,
  xxl: isSmallDevice() ? 32 : 48,
};

// Responsive border radius
export const borderRadius = {
  xs: isSmallDevice() ? 2 : 4,
  sm: isSmallDevice() ? 4 : 8,
  md: isSmallDevice() ? 8 : 12,
  lg: isSmallDevice() ? 12 : 16,
  xl: isSmallDevice() ? 16 : 24,
  xxl: isSmallDevice() ? 24 : 32,
};

// Device-specific styles
export const deviceStyles = {
  shadow: Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
    android: {
      elevation: 5,
    },
  }),
  safeArea: Platform.select({
    ios: {
      paddingTop: 44,
      paddingBottom: 34,
    },
    android: {
      paddingTop: 24,
      paddingBottom: 24,
    },
  }),
};

// Responsive grid layout
export const getGridColumns = () => {
  if (isTablet()) {
    return 3;
  }
  if (isLargeDevice()) {
    return 2;
  }
  return 1;
};

// Enhanced responsive image sizes for all mobile devices
export const imageSizes = {
  thumbnail: isVerySmallDevice()
    ? 36
    : isSmallDevice()
      ? 40
      : isCompactDevice()
        ? 44
        : 50,
  avatar: isVerySmallDevice()
    ? 28
    : isSmallDevice()
      ? 32
      : isCompactDevice()
        ? 36
        : 40,
  messageImage: isVerySmallDevice()
    ? 180
    : isSmallDevice()
      ? 200
      : isCompactDevice()
        ? 220
        : 250,
  groupImage: isVerySmallDevice()
    ? 56
    : isSmallDevice()
      ? 60
      : isCompactDevice()
        ? 68
        : 80,
  profileImage: isVerySmallDevice()
    ? 80
    : isSmallDevice()
      ? 90
      : isCompactDevice()
        ? 100
        : 120,
};

// Enhanced responsive modal sizes
export const modalSizes = {
  width: isTablet() ? "80%" : isLargeDevice() ? "85%" : "90%",
  maxHeight: isTablet() ? "80%" : isLargeDevice() ? "85%" : "90%",
  borderRadius: isVerySmallDevice() ? 12 : isCompactDevice() ? 16 : 20,
};

// Enhanced responsive list item heights
export const listItemHeights = {
  message: isVerySmallDevice()
    ? 56
    : isSmallDevice()
      ? 60
      : isCompactDevice()
        ? 64
        : 70,
  group: isVerySmallDevice()
    ? 66
    : isSmallDevice()
      ? 70
      : isCompactDevice()
        ? 74
        : 80,
  member: isVerySmallDevice()
    ? 46
    : isSmallDevice()
      ? 50
      : isCompactDevice()
        ? 54
        : 60,
  contact: isVerySmallDevice()
    ? 52
    : isSmallDevice()
      ? 56
      : isCompactDevice()
        ? 60
        : 64,
};

// Enhanced responsive input sizes
export const inputSizes = {
  height: isVerySmallDevice()
    ? 36
    : isSmallDevice()
      ? 40
      : isCompactDevice()
        ? 44
        : 48,
  fontSize: isVerySmallDevice()
    ? 13
    : isSmallDevice()
      ? 14
      : isCompactDevice()
        ? 15
        : 16,
  padding: isVerySmallDevice()
    ? 6
    : isSmallDevice()
      ? 8
      : isCompactDevice()
        ? 10
        : 12,
  borderRadius: isVerySmallDevice() ? 8 : isCompactDevice() ? 10 : 12,
};

// Enhanced responsive button sizes
export const buttonSizes = {
  height: isVerySmallDevice()
    ? 36
    : isSmallDevice()
      ? 40
      : isCompactDevice()
        ? 44
        : 48,
  fontSize: isVerySmallDevice()
    ? 13
    : isSmallDevice()
      ? 14
      : isCompactDevice()
        ? 15
        : 16,
  padding: isVerySmallDevice()
    ? 6
    : isSmallDevice()
      ? 8
      : isCompactDevice()
        ? 10
        : 12,
  borderRadius: isVerySmallDevice()
    ? 18
    : isSmallDevice()
      ? 20
      : isCompactDevice()
        ? 22
        : 24,
  iconSize: isVerySmallDevice()
    ? 16
    : isSmallDevice()
      ? 18
      : isCompactDevice()
        ? 20
        : 22,
};

// Enhanced responsive header sizes - INCREASED for better visibility
export const headerSizes = {
  height: isVerySmallDevice()
    ? 56
    : isSmallDevice()
      ? 64
      : isCompactDevice()
        ? 68
        : 72, // Increased by 10-12px
  fontSize: isVerySmallDevice()
    ? 18
    : isSmallDevice()
      ? 20
      : isCompactDevice()
        ? 22
        : 24, // Increased by 2-4px
  iconSize: isVerySmallDevice()
    ? 28
    : isSmallDevice()
      ? 32
      : isCompactDevice()
        ? 36
        : 40, // Increased by 8-12px
  paddingHorizontal: isVerySmallDevice() ? 16 : isCompactDevice() ? 20 : 24, // Increased by 4px
};

// Enhanced responsive tab bar sizes
export const tabBarSizes = {
  height: isVerySmallDevice()
    ? 46
    : isSmallDevice()
      ? 50
      : isCompactDevice()
        ? 54
        : 60,
  fontSize: isVerySmallDevice()
    ? 10
    : isSmallDevice()
      ? 12
      : isCompactDevice()
        ? 13
        : 14,
  iconSize: isVerySmallDevice()
    ? 18
    : isSmallDevice()
      ? 20
      : isCompactDevice()
        ? 22
        : 24,
  paddingBottom: Platform.OS === "ios" ? (isVerySmallDevice() ? 16 : 20) : 5,
};

// Enhanced responsive bottom sheet sizes
export const bottomSheetSizes = {
  height: isVerySmallDevice()
    ? "35%"
    : isSmallDevice()
      ? "40%"
      : isCompactDevice()
        ? "45%"
        : "50%",
  handleHeight: isVerySmallDevice() ? 3 : isSmallDevice() ? 4 : 6,
  borderRadius: isVerySmallDevice() ? 12 : isSmallDevice() ? 16 : 20,
  paddingHorizontal: isVerySmallDevice() ? 12 : isCompactDevice() ? 16 : 20,
};

// Responsive keyboard handling
export const keyboardAvoidingBehavior = Platform.select({
  ios: "padding",
  android: "height",
});

// Responsive scroll view settings
export const scrollViewSettings = {
  contentContainerStyle: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  showsVerticalScrollIndicator: false,
  bounces: true,
};

// Responsive flat list settings
export const flatListSettings = {
  contentContainerStyle: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  showsVerticalScrollIndicator: false,
  bounces: true,
  initialNumToRender: isSmallDevice() ? 5 : 10,
  maxToRenderPerBatch: isSmallDevice() ? 5 : 10,
  windowSize: isSmallDevice() ? 5 : 10,
};

// Font size scaling
export const fontScale = (size: number) => {
  const scale = SCREEN_WIDTH / 375; // 375 is the base width (iPhone 8)
  const newSize = size * scale;

  // Limit the minimum and maximum font sizes
  if (Platform.OS === "ios") {
    return Math.round(Math.min(Math.max(newSize, 12), 40));
  }
  return Math.round(Math.min(Math.max(newSize, 12), 40));
};

// Platform-specific adjustments
export const platformSpecific = {
  topPadding: Platform.OS === "ios" ? 44 : StatusBar.currentHeight || 0,
  bottomPadding: Platform.OS === "ios" ? 34 : 0,
  safeAreaBottom: Platform.OS === "ios" ? 34 : 0,
};

// Aspect ratio calculations
export const getAspectRatio = (width: number, height: number) => {
  return width / height;
};

// Media dimensions
export const mediaDimensions = {
  width: SCREEN_WIDTH,
  height: getActualHeight(),
  aspectRatio: getAspectRatio(SCREEN_WIDTH, getActualHeight()),
};
