import React, { useRef, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useSegments } from 'expo-router';
import { BlurView } from 'expo-blur';

const { width: screenWidth } = Dimensions.get('window');

interface TabConfig {
  name: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
}

const tabs: TabConfig[] = [
  { name: 'chats', title: 'Chats', icon: 'chatbubbles', route: '/(tabs)' },
  { name: 'groups', title: 'Groups', icon: 'people', route: '/(tabs)/groups' },
  { name: 'updates', title: 'Updates', icon: 'radio-button-on', route: '/(tabs)/updates' },
  { name: 'calls', title: 'Calls', icon: 'call', route: '/(tabs)/calls' },
];

export default function AnimatedTabBar() {
  const router = useRouter();
  const segments = useSegments();
  
  // Animation values
  const indicatorPosition = useRef(new Animated.Value(0)).current;
  const tabScales = useRef(tabs.map(() => new Animated.Value(1))).current;
  const tabOpacities = useRef(tabs.map(() => new Animated.Value(0.6))).current;

  // Get current tab index
  const getCurrentTabIndex = () => {
    const currentSegment = segments[segments.length - 1];
    if (currentSegment === 'groups') return 1;
    if (currentSegment === 'updates') return 2;
    if (currentSegment === 'calls') return 3;
    return 0;
  };

  const activeTabIndex = getCurrentTabIndex();

  // Animate indicator and tab states
  useEffect(() => {
    const tabWidth = screenWidth / tabs.length;
    
    // Animate indicator position
    Animated.spring(indicatorPosition, {
      toValue: activeTabIndex * tabWidth,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();

    // Animate tab scales and opacities
    tabs.forEach((_, index) => {
      const isActive = index === activeTabIndex;
      
      Animated.parallel([
        Animated.spring(tabScales[index], {
          toValue: isActive ? 1.1 : 1,
          useNativeDriver: true,
          tension: 300,
          friction: 20,
        }),
        Animated.timing(tabOpacities[index], {
          toValue: isActive ? 1 : 0.6,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start();
    });
  }, [activeTabIndex]);

  const handleTabPress = (index: number) => {
    if (index === activeTabIndex) return;

    // Add haptic feedback
    if (Platform.OS === 'ios') {
      // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    // Animate tab press
    Animated.sequence([
      Animated.spring(tabScales[index], {
        toValue: 0.95,
        useNativeDriver: true,
        tension: 300,
        friction: 20,
      }),
      Animated.spring(tabScales[index], {
        toValue: 1.1,
        useNativeDriver: true,
        tension: 300,
        friction: 20,
      })
    ]).start();

    // Navigate to tab
    router.push(tabs[index].route);
  };

  const tabWidth = screenWidth / tabs.length;

  return (
    <View style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: Platform.OS === 'ios' ? 85 : 65,
      backgroundColor: Platform.OS === 'ios' ? 'transparent' : '#FFFFFF',
      borderTopWidth: Platform.OS === 'ios' ? 0 : 1,
      borderTopColor: '#E5E7EB',
    }}>
      {/* iOS Blur Background */}
      {Platform.OS === 'ios' && (
        <BlurView
          intensity={85}
          tint="light"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        />
      )}

      {/* Animated Indicator */}
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          width: tabWidth,
          height: 3,
          backgroundColor: '#667eea',
          borderRadius: 1.5,
          transform: [{ translateX: indicatorPosition }],
        }}
      />

      {/* Tab Buttons */}
      <View style={{
        flexDirection: 'row',
        height: '100%',
        paddingBottom: Platform.OS === 'ios' ? 20 : 5,
        paddingTop: 8,
      }}>
        {tabs.map((tab, index) => (
          <TouchableOpacity
            key={tab.name}
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onPress={() => handleTabPress(index)}
            activeOpacity={0.7}
          >
            <Animated.View
              style={{
                alignItems: 'center',
                transform: [{ scale: tabScales[index] }],
                opacity: tabOpacities[index],
              }}
            >
              <View style={{
                padding: 4,
                borderRadius: 12,
                backgroundColor: activeTabIndex === index ? 'rgba(102, 126, 234, 0.1)' : 'transparent',
              }}>
                <Ionicons
                  name={tab.icon}
                  size={24}
                  color={activeTabIndex === index ? '#667eea' : '#8E8E93'}
                />
              </View>
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: '600',
                  color: activeTabIndex === index ? '#667eea' : '#8E8E93',
                  marginTop: 4,
                }}
              >
                {tab.title}
              </Text>
            </Animated.View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Floating Action Indicators */}
      {activeTabIndex === 0 && (
        <Animated.View
          style={{
            position: 'absolute',
            top: -20,
            right: 20,
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: '#667eea',
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </Animated.View>
      )}
    </View>
  );
}

// Tab transition animations
export const TabTransitionAnimations = {
  slideLeft: {
    cardStyleInterpolator: ({ current, layouts }: any) => {
      return {
        cardStyle: {
          transform: [
            {
              translateX: current.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [layouts.screen.width, 0],
              }),
            },
          ],
        },
      };
    },
  },
  slideRight: {
    cardStyleInterpolator: ({ current, layouts }: any) => {
      return {
        cardStyle: {
          transform: [
            {
              translateX: current.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [-layouts.screen.width, 0],
              }),
            },
          ],
        },
      };
    },
  },
  fadeScale: {
    cardStyleInterpolator: ({ current }: any) => {
      return {
        cardStyle: {
          opacity: current.progress,
          transform: [
            {
              scale: current.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [0.9, 1],
              }),
            },
          ],
        },
      };
    },
  },
};
