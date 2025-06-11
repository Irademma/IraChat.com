import { useEffect, useState } from 'react';
import { Dimensions, ScaledSize } from 'react-native';
import {
    fontSize,
    hp,
    isLargeDevice,
    isMediumDevice,
    isSmallDevice,
    isTablet,
    spacing,
    wp
} from '../utils/responsive';

interface ResponsiveState {
  width: number;
  height: number;
  isLandscape: boolean;
  isSmall: boolean;
  isMedium: boolean;
  isLarge: boolean;
  isTablet: boolean;
  wp: (percentage: number) => number;
  hp: (percentage: number) => number;
  fontSize: typeof fontSize;
  spacing: typeof spacing;
}

export const useResponsive = (): ResponsiveState => {
  const [dimensions, setDimensions] = useState<ScaledSize>(Dimensions.get('window'));

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });

    return () => subscription.remove();
  }, []);

  const isLandscape = dimensions.width > dimensions.height;

  return {
    width: dimensions.width,
    height: dimensions.height,
    isLandscape,
    isSmall: isSmallDevice(),
    isMedium: isMediumDevice(),
    isLarge: isLargeDevice(),
    isTablet: isTablet(),
    wp,
    hp,
    fontSize,
    spacing,
  };
}; 