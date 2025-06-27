// Simplified Tab Navigator for IraChat
import { useRouter, useSegments } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

// Tab configuration for IraChat - Only 4 tabs as requested
const TABS = [
  { name: 'Chats', route: '/(tabs)/', icon: 'chatbubbles' },
  { name: 'Groups', route: '/(tabs)/groups', icon: 'people' },
  { name: 'Updates', route: '/(tabs)/updates', icon: 'camera' },
  { name: 'Calls', route: '/(tabs)/calls', icon: 'call' },
];

interface SwipeTabNavigatorProps {
  children: React.ReactNode;
}

export const SwipeTabNavigator: React.FC<SwipeTabNavigatorProps> = ({ children }) => {
  // Simplified version without gesture handling to prevent errors
  return (
    <View style={{ flex: 1 }}>
      {children}
    </View>
  );
};

// Hook for programmatic tab navigation
export const useSwipeNavigation = () => {
  const router = useRouter();
  const segments = useSegments();

  const getCurrentTabIndex = (): number => {
    const currentSegment = segments[segments.length - 1];
    
    switch (currentSegment) {
      case 'groups': return 1;
      case 'updates': return 2;
      case 'calls': return 3;
      default: return 0;
    }
  };

  const navigateToTab = (index: number) => {
    if (index < 0 || index >= TABS.length) return;
    
    const targetTab = TABS[index];
    router.push(targetTab.route as any);
  };

  return {
    currentTabIndex: getCurrentTabIndex(),
    navigateToTab,
    tabs: TABS,
  };
};
