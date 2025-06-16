// Animated Tab Bar Component for Scroll-Responsive UI
import React from 'react';
import { View, TouchableOpacity, Text, Platform } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useSegments } from 'expo-router';

interface TabItem {
  name: string;
  route: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
  label: string;
}

interface AnimatedTabBarProps {
  translateY: any; // Reanimated shared value
  backgroundColor?: string;
  activeColor?: string;
  inactiveColor?: string;
  height?: number;
  tabs?: TabItem[];
}

const DEFAULT_TABS: TabItem[] = [
  {
    name: 'chats',
    route: '/(tabs)',
    icon: 'chatbubble-outline',
    activeIcon: 'chatbubble',
    label: 'Chats',
  },
  {
    name: 'groups',
    route: '/(tabs)/groups',
    icon: 'people-outline',
    activeIcon: 'people',
    label: 'Groups',
  },
  {
    name: 'updates',
    route: '/(tabs)/updates',
    icon: 'play-circle-outline',
    activeIcon: 'play-circle',
    label: 'Updates',
  },
  {
    name: 'calls',
    route: '/(tabs)/calls',
    icon: 'call-outline',
    activeIcon: 'call',
    label: 'Calls',
  },
  {
    name: 'profile',
    route: '/(tabs)/profile',
    icon: 'person-outline',
    activeIcon: 'person',
    label: 'Profile',
  },
];

export const AnimatedTabBar: React.FC<AnimatedTabBarProps> = ({
  translateY,
  backgroundColor = '#ffffff',
  activeColor = '#87CEEB',
  inactiveColor = '#9ca3af',
  height = 80,
  tabs = DEFAULT_TABS,
}) => {
  const router = useRouter();
  const segments = useSegments();
  const insets = useSafeAreaInsets();
  const totalHeight = height + insets.bottom;

  // Get current active tab
  const getCurrentTab = (): string => {
    const currentSegment = segments[segments.length - 1];
    
    switch (currentSegment) {
      case 'groups': return 'groups';
      case 'updates': return 'updates';
      case 'calls': return 'calls';
      case 'profile': return 'profile';
      default: return 'chats';
    }
  };

  const activeTab = getCurrentTab();

  // Animated style for tab bar translation
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  // Handle tab press
  const handleTabPress = (tab: TabItem) => {
    if (tab.name !== activeTab) {
      router.push(tab.route);
    }
  };

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: totalHeight,
          backgroundColor: backgroundColor,
          zIndex: 999,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 8,
          borderTopWidth: 1,
          borderTopColor: 'rgba(0,0,0,0.1)',
        },
        animatedStyle,
      ]}
    >
      {/* Tab Bar Content */}
      <View
        style={{
          height: height,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-around',
          paddingHorizontal: 8,
        }}
      >
        {tabs.map((tab) => {
          const isActive = tab.name === activeTab;
          const iconName = isActive ? tab.activeIcon : tab.icon;
          const color = isActive ? activeColor : inactiveColor;

          return (
            <TouchableOpacity
              key={tab.name}
              onPress={() => handleTabPress(tab)}
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 8,
              }}
              activeOpacity={0.7}
            >
              {/* Tab Icon */}
              <View
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 4,
                }}
              >
                <Ionicons name={iconName} size={24} color={color} />
                
                {/* Active Indicator Dot */}
                {isActive && (
                  <View
                    style={{
                      width: 4,
                      height: 4,
                      borderRadius: 2,
                      backgroundColor: activeColor,
                      marginTop: 2,
                    }}
                  />
                )}
              </View>

              {/* Tab Label */}
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: isActive ? '600' : '400',
                  color: color,
                  textAlign: 'center',
                }}
                numberOfLines={1}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Safe Area Bottom Spacer */}
      <View style={{ height: insets.bottom, backgroundColor: backgroundColor }} />
    </Animated.View>
  );
};

// IraChat-specific tab bar with custom styling
export const IraChatTabBar: React.FC<{
  translateY: any;
}> = ({ translateY }) => {
  return (
    <AnimatedTabBar
      translateY={translateY}
      backgroundColor="#ffffff"
      activeColor="#87CEEB"
      inactiveColor="#9ca3af"
      height={80}
    />
  );
};
