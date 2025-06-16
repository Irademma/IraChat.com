import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Image,
  Animated,
  ImageSourcePropType,
  Easing,
  Platform,
} from "react-native";
import {
  createRotationAnimation,
  getAnimationConfig,
} from "../../utils/animations";
import { useResponsiveDimensions } from "../../hooks/useResponsiveDimensions";

interface AnimatedLogoProps {
  size?: number;
  source: ImageSourcePropType;
}

export default function AnimatedLogo({
  size = 96,
  source,
}: AnimatedLogoProps): React.JSX.Element {
  const [imageLoaded, setImageLoaded] = useState(false);
  const { isSmall } = useResponsiveDimensions();
  const animConfig = getAnimationConfig();

  // Create animation value
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Responsive size adjustment - Updated for larger logo sizes
  const responsiveSize = isSmall ? Math.min(size, 120) : size;

  // Continuous animation with Animated.timing
  useEffect(() => {
    let isMounted = true;

    const animate = () => {
      if (!isMounted) return;

      // Create a fresh animation each time with linear easing for consistent speed
      const rotation = Animated.timing(rotateAnim, {
        toValue: 1,
        duration: isSmall ? 1500 : 2000, // Faster on small screens
        easing: Easing.linear, // Linear easing for constant speed
        useNativeDriver: animConfig.useNativeDriver,
        isInteraction: false, // Don't block other interactions
      });

      rotation.start((finished) => {
        if (finished && isMounted) {
          // Immediately reset and restart with no delay
          rotateAnim.setValue(0);
          animate(); // Direct call - no setTimeout delay
        }
      });

      animationRef.current = rotation;
    };

    // Start the animation
    rotateAnim.setValue(0);
    animate();

    // Cleanup
    return () => {
      isMounted = false;
      if (animationRef.current) {
        animationRef.current.stop();
      }
    };
  }, [rotateAnim]);

  // Create rotation interpolation for continuous 360-degree rotation
  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
    extrapolate: "extend", // Ensure smooth continuous rotation
  });

  const borderWidth = isSmall ? 4 : responsiveSize > 120 ? 6 : 5;
  const shadowProps =
    Platform.OS === "web"
      ? {
          // Use boxShadow for web
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        }
      : {
          // Use shadow props for native
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        };

  return (
    <View
      style={{
        width: responsiveSize,
        height: responsiveSize,
      }}
      className="items-center justify-center"
    >
      {/* Animated Border - Only the border rotates */}
      <Animated.View
        style={{
          position: "absolute",
          width: responsiveSize,
          height: responsiveSize,
          borderRadius: responsiveSize / 2,
          borderWidth,
          borderColor: "transparent",
          borderTopColor: "#3B82F6", // Blue-500
          borderRightColor: "#667eea", // Sky blue from welcome page
          borderBottomColor: "#F59E0B", // Amber-500
          borderLeftColor: "#EF4444", // Red-500
          transform: [{ rotate }],
        }}
      />

      {/* Static Logo Container - Logo stays still */}
      <View
        style={{
          width: responsiveSize - borderWidth * 2, // Account for border width
          height: responsiveSize - borderWidth * 2,
          borderRadius: (responsiveSize - borderWidth * 2) / 2,
          backgroundColor: "#FFFFFF",
          overflow: "hidden",
          ...shadowProps,
        }}
        className="items-center justify-center"
      >
        <Image
          source={source}
          style={{
            width: responsiveSize - borderWidth * 2,
            height: responsiveSize - borderWidth * 2,
            borderRadius: (responsiveSize - borderWidth * 2) / 2,
          }}
          resizeMode="contain"
          fadeDuration={0} // Remove fade-in animation for immediate display
          onLoad={() => setImageLoaded(true)}
        />
      </View>
    </View>
  );
}
