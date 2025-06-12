import React, { useRef, useEffect } from 'react';
import {
  View,
  Animated,
  ScrollView,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';

interface ScrollAwareLayoutProps {
  children: React.ReactNode;
  headerComponent?: React.ReactNode;
  footerComponent?: React.ReactNode;
  onHeaderVisibilityChange?: (isVisible: boolean) => void;
  onFooterVisibilityChange?: (isVisible: boolean) => void;
  scrollThreshold?: number;
  animationDuration?: number;
}

export const ScrollAwareLayout: React.FC<ScrollAwareLayoutProps> = ({
  children,
  headerComponent,
  footerComponent,
  onHeaderVisibilityChange,
  onFooterVisibilityChange,
  scrollThreshold = 50,
  animationDuration = 200,
}) => {
  const headerOpacity = useRef(new Animated.Value(1)).current;
  const headerTranslateY = useRef(new Animated.Value(0)).current;
  const footerOpacity = useRef(new Animated.Value(1)).current;
  const footerTranslateY = useRef(new Animated.Value(0)).current;
  
  const lastScrollY = useRef(0);
  const isHeaderVisible = useRef(true);
  const isFooterVisible = useRef(true);

  const hideHeader = () => {
    if (isHeaderVisible.current) {
      isHeaderVisible.current = false;
      onHeaderVisibilityChange?.(false);
      
      Animated.parallel([
        Animated.timing(headerOpacity, {
          toValue: 0,
          duration: animationDuration,
          useNativeDriver: true,
        }),
        Animated.timing(headerTranslateY, {
          toValue: -100,
          duration: animationDuration,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const showHeader = () => {
    if (!isHeaderVisible.current) {
      isHeaderVisible.current = true;
      onHeaderVisibilityChange?.(true);
      
      Animated.parallel([
        Animated.timing(headerOpacity, {
          toValue: 1,
          duration: animationDuration,
          useNativeDriver: true,
        }),
        Animated.timing(headerTranslateY, {
          toValue: 0,
          duration: animationDuration,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const hideFooter = () => {
    if (isFooterVisible.current) {
      isFooterVisible.current = false;
      onFooterVisibilityChange?.(false);
      
      Animated.parallel([
        Animated.timing(footerOpacity, {
          toValue: 0,
          duration: animationDuration,
          useNativeDriver: true,
        }),
        Animated.timing(footerTranslateY, {
          toValue: 100,
          duration: animationDuration,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const showFooter = () => {
    if (!isFooterVisible.current) {
      isFooterVisible.current = true;
      onFooterVisibilityChange?.(true);
      
      Animated.parallel([
        Animated.timing(footerOpacity, {
          toValue: 1,
          duration: animationDuration,
          useNativeDriver: true,
        }),
        Animated.timing(footerTranslateY, {
          toValue: 0,
          duration: animationDuration,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    const scrollDirection = currentScrollY > lastScrollY.current ? 'down' : 'up';
    const scrollDelta = Math.abs(currentScrollY - lastScrollY.current);

    // Only trigger animations if scroll delta exceeds threshold
    if (scrollDelta > scrollThreshold) {
      if (scrollDirection === 'down') {
        // Scrolling down - hide header and footer
        hideHeader();
        hideFooter();
      } else {
        // Scrolling up - show header and footer
        showHeader();
        showFooter();
      }
    }

    lastScrollY.current = currentScrollY;
  };

  // Enhanced scroll handler for FlatList compatibility
  const createScrollHandler = () => {
    return Animated.event(
      [{ nativeEvent: { contentOffset: { y: new Animated.Value(0) } } }],
      {
        useNativeDriver: false,
        listener: handleScroll,
      }
    );
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Header */}
      {headerComponent && (
        <Animated.View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            opacity: headerOpacity,
            transform: [{ translateY: headerTranslateY }],
          }}
        >
          {headerComponent}
        </Animated.View>
      )}

      {/* Main Content */}
      <View style={{ flex: 1, paddingTop: headerComponent ? 100 : 0, paddingBottom: footerComponent ? 80 : 0 }}>
        {React.cloneElement(children as React.ReactElement, {
          onScroll: createScrollHandler(),
          scrollEventThrottle: 16,
        })}
      </View>

      {/* Footer */}
      {footerComponent && (
        <Animated.View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            opacity: footerOpacity,
            transform: [{ translateY: footerTranslateY }],
          }}
        >
          {footerComponent}
        </Animated.View>
      )}
    </View>
  );
};

// Hook for scroll-aware behavior in custom components
export const useScrollAware = (scrollThreshold = 50) => {
  const headerOpacity = useRef(new Animated.Value(1)).current;
  const footerOpacity = useRef(new Animated.Value(1)).current;
  const lastScrollY = useRef(0);
  const isHeaderVisible = useRef(true);
  const isFooterVisible = useRef(true);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    const scrollDirection = currentScrollY > lastScrollY.current ? 'down' : 'up';
    const scrollDelta = Math.abs(currentScrollY - lastScrollY.current);

    if (scrollDelta > scrollThreshold) {
      const targetOpacity = scrollDirection === 'down' ? 0 : 1;
      
      if (scrollDirection === 'down' && isHeaderVisible.current) {
        isHeaderVisible.current = false;
        isFooterVisible.current = false;
        
        Animated.parallel([
          Animated.timing(headerOpacity, {
            toValue: targetOpacity,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(footerOpacity, {
            toValue: targetOpacity,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      } else if (scrollDirection === 'up' && !isHeaderVisible.current) {
        isHeaderVisible.current = true;
        isFooterVisible.current = true;
        
        Animated.parallel([
          Animated.timing(headerOpacity, {
            toValue: targetOpacity,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(footerOpacity, {
            toValue: targetOpacity,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }

    lastScrollY.current = currentScrollY;
  };

  const scrollHandler = Animated.event(
    [{ nativeEvent: { contentOffset: { y: new Animated.Value(0) } } }],
    {
      useNativeDriver: false,
      listener: handleScroll,
    }
  );

  return {
    headerOpacity,
    footerOpacity,
    scrollHandler,
    isHeaderVisible: isHeaderVisible.current,
    isFooterVisible: isFooterVisible.current,
  };
};

// Higher-order component for adding scroll-aware behavior
export const withScrollAware = <P extends object>(
  Component: React.ComponentType<P>
) => {
  return React.forwardRef<any, P & { scrollThreshold?: number }>((props, ref) => {
    const { scrollThreshold, ...componentProps } = props;
    const scrollAware = useScrollAware(scrollThreshold);

    return (
      <Component
        {...(componentProps as P)}
        ref={ref}
        scrollAware={scrollAware}
      />
    );
  });
};
