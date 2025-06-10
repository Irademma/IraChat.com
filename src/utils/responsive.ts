import { Dimensions, Platform, StatusBar } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Get the actual screen height excluding status bar
const getActualHeight = () => {
  if (Platform.OS === 'ios') {
    return SCREEN_HEIGHT;
  }
  return SCREEN_HEIGHT - (StatusBar.currentHeight || 0);
};

// Device type detection
export const isTablet = () => {
  const { width, height } = Dimensions.get('window');
  const aspectRatio = height / width;
  return aspectRatio <= 1.6;
};

export const isSmallDevice = () => {
  return SCREEN_WIDTH < 375;
};

export const isLargeDevice = () => {
  return SCREEN_WIDTH > 768;
};

// Responsive dimensions
export const wp = (percentage: number) => {
  return (SCREEN_WIDTH * percentage) / 100;
};

export const hp = (percentage: number) => {
  return (SCREEN_HEIGHT * percentage) / 100;
};

// Responsive font sizes
export const fontSizes = {
  xs: isSmallDevice() ? 10 : 12,
  sm: isSmallDevice() ? 12 : 14,
  md: isSmallDevice() ? 14 : 16,
  lg: isSmallDevice() ? 16 : 18,
  xl: isSmallDevice() ? 18 : 20,
  xxl: isSmallDevice() ? 20 : 24,
};

// Export individual fontSize object for UpdateCard compatibility
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
      shadowColor: '#000',
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

// Responsive image sizes
export const imageSizes = {
  thumbnail: isSmallDevice() ? 40 : 50,
  avatar: isSmallDevice() ? 32 : 40,
  messageImage: isSmallDevice() ? 200 : 250,
  groupImage: isSmallDevice() ? 60 : 80,
};

// Responsive modal sizes
export const modalSizes = {
  width: isTablet() ? '80%' : '90%',
  maxHeight: isTablet() ? '80%' : '90%',
};

// Responsive list item heights
export const listItemHeights = {
  message: isSmallDevice() ? 60 : 70,
  group: isSmallDevice() ? 70 : 80,
  member: isSmallDevice() ? 50 : 60,
};

// Responsive input sizes
export const inputSizes = {
  height: isSmallDevice() ? 40 : 48,
  fontSize: isSmallDevice() ? 14 : 16,
  padding: isSmallDevice() ? 8 : 12,
};

// Responsive button sizes
export const buttonSizes = {
  height: isSmallDevice() ? 40 : 48,
  fontSize: isSmallDevice() ? 14 : 16,
  padding: isSmallDevice() ? 8 : 12,
  borderRadius: isSmallDevice() ? 20 : 24,
};

// Responsive header sizes
export const headerSizes = {
  height: isSmallDevice() ? 50 : 60,
  fontSize: isSmallDevice() ? 18 : 20,
  iconSize: isSmallDevice() ? 24 : 28,
};

// Responsive tab bar sizes
export const tabBarSizes = {
  height: isSmallDevice() ? 50 : 60,
  fontSize: isSmallDevice() ? 12 : 14,
  iconSize: isSmallDevice() ? 20 : 24,
};

// Responsive bottom sheet sizes
export const bottomSheetSizes = {
  height: isSmallDevice() ? '40%' : '50%',
  handleHeight: isSmallDevice() ? 4 : 6,
  borderRadius: isSmallDevice() ? 16 : 20,
};

// Responsive keyboard handling
export const keyboardAvoidingBehavior = Platform.select({
  ios: 'padding',
  android: 'height',
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
  if (Platform.OS === 'ios') {
    return Math.round(Math.min(Math.max(newSize, 12), 40));
  }
  return Math.round(Math.min(Math.max(newSize, 12), 40));
};

// Platform-specific adjustments
export const platformSpecific = {
  topPadding: Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 0,
  bottomPadding: Platform.OS === 'ios' ? 34 : 0,
  safeAreaBottom: Platform.OS === 'ios' ? 34 : 0,
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