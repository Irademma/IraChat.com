// Scroll-Responsive Container Component
import React, { forwardRef } from 'react';
import { View, FlatList, ScrollView, RefreshControl } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useScrollResponsive } from '../hooks/useScrollResponsive';
import { AnimatedHeader, IraChatHeader, ChatHeader } from './AnimatedHeader';
import { AnimatedTabBar, IraChatTabBar } from './AnimatedTabBar';

// Create animated versions of scroll components
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);
const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

interface ScrollResponsiveContainerProps {
  children?: React.ReactNode;
  
  // Header props
  headerTitle?: string;
  headerType?: 'default' | 'irachat' | 'chat';
  headerProps?: any;
  showHeader?: boolean;
  
  // Tab bar props
  showTabBar?: boolean;
  tabBarType?: 'default' | 'irachat';
  
  // Scroll props
  scrollType?: 'scrollview' | 'flatlist';
  flatListProps?: any;
  scrollViewProps?: any;
  
  // Refresh control
  refreshing?: boolean;
  onRefresh?: () => void;
  
  // Styling
  backgroundColor?: string;
  contentContainerStyle?: any;
  
  // Scroll behavior config
  scrollConfig?: {
    threshold?: number;
    animationDuration?: number;
    enableHaptics?: boolean;
  };
}

export const ScrollResponsiveContainer = forwardRef<any, ScrollResponsiveContainerProps>(
  (
    {
      children,
      headerTitle = 'IraChat',
      headerType = 'irachat',
      headerProps = {},
      showHeader = true,
      showTabBar = true,
      tabBarType = 'irachat',
      scrollType = 'scrollview',
      flatListProps = {},
      scrollViewProps = {},
      refreshing = false,
      onRefresh,
      backgroundColor = '#f9fafb',
      contentContainerStyle = {},
      scrollConfig = {},
    },
    ref
  ) => {
    const insets = useSafeAreaInsets();
    
    // Initialize scroll-responsive behavior
    const {
      headerTranslateY,
      tabBarTranslateY,
      onScroll,
      resetBars,
    } = useScrollResponsive({
      threshold: 15,
      animationDuration: 250,
      headerHeight: 60,
      tabBarHeight: 80,
      enableHaptics: true,
      ...scrollConfig,
    });

    // Calculate content padding
    const headerHeight = showHeader ? 60 + insets.top : insets.top;
    const tabBarHeight = showTabBar ? 80 + insets.bottom : insets.bottom;

    // Render appropriate header
    const renderHeader = () => {
      if (!showHeader) return null;

      switch (headerType) {
        case 'irachat':
          return <IraChatHeader translateY={headerTranslateY} {...headerProps} />;
        case 'chat':
          return <ChatHeader translateY={headerTranslateY} {...headerProps} />;
        default:
          return (
            <AnimatedHeader
              title={headerTitle}
              translateY={headerTranslateY}
              {...headerProps}
            />
          );
      }
    };

    // Render appropriate tab bar
    const renderTabBar = () => {
      if (!showTabBar) return null;

      switch (tabBarType) {
        case 'irachat':
          return <IraChatTabBar translateY={tabBarTranslateY} />;
        default:
          return <AnimatedTabBar translateY={tabBarTranslateY} />;
      }
    };

    // Common scroll props
    const commonScrollProps = {
      ref,
      onScroll,
      scrollEventThrottle: 16,
      showsVerticalScrollIndicator: false,
      contentContainerStyle: [
        {
          paddingTop: headerHeight,
          paddingBottom: tabBarHeight,
          backgroundColor: backgroundColor,
        },
        contentContainerStyle,
      ],
      refreshControl: onRefresh ? (
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            resetBars(); // Show bars when refreshing
            onRefresh();
          }}
          tintColor="#87CEEB"
          colors={['#87CEEB']}
          progressViewOffset={headerHeight}
        />
      ) : undefined,
    };

    return (
      <View style={{ flex: 1, backgroundColor }}>
        {/* Scrollable Content */}
        {scrollType === 'flatlist' ? (
          <AnimatedFlatList
            {...commonScrollProps}
            {...flatListProps}
          />
        ) : (
          <AnimatedScrollView
            {...commonScrollProps}
            {...scrollViewProps}
          >
            {children}
          </AnimatedScrollView>
        )}

        {/* Animated Header */}
        {renderHeader()}

        {/* Animated Tab Bar */}
        {renderTabBar()}
      </View>
    );
  }
);

ScrollResponsiveContainer.displayName = 'ScrollResponsiveContainer';

// Convenience components for specific use cases
export const IraChatScrollContainer: React.FC<{
  children: React.ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
}> = ({ children, refreshing, onRefresh }) => {
  return (
    <ScrollResponsiveContainer
      headerType="irachat"
      tabBarType="irachat"
      refreshing={refreshing}
      onRefresh={onRefresh}
    >
      {children}
    </ScrollResponsiveContainer>
  );
};

export const ChatScrollContainer: React.FC<{
  children: React.ReactNode;
  contactName: string;
  isOnline?: boolean;
  onBackPress: () => void;
}> = ({ children, contactName, isOnline, onBackPress }) => {
  return (
    <ScrollResponsiveContainer
      headerType="chat"
      headerProps={{
        contactName,
        isOnline,
        onBackPress,
      }}
      showTabBar={false}
    >
      {children}
    </ScrollResponsiveContainer>
  );
};

export const FlatListScrollContainer: React.FC<{
  data: any[];
  renderItem: any;
  keyExtractor?: any;
  refreshing?: boolean;
  onRefresh?: () => void;
  headerTitle?: string;
  showTabBar?: boolean;
}> = ({ data, renderItem, keyExtractor, refreshing, onRefresh, headerTitle, showTabBar = true }) => {
  return (
    <ScrollResponsiveContainer
      scrollType="flatlist"
      headerTitle={headerTitle}
      showTabBar={showTabBar}
      refreshing={refreshing}
      onRefresh={onRefresh}
      flatListProps={{
        data,
        renderItem,
        keyExtractor,
      }}
    />
  );
};
