
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Image, Platform, View } from 'react-native';
import TabBarBackground from '../../src/components/ui/TabBarBackground';
import {
    headerSizes,
    isVerySmallDevice,
    tabBarSizes
} from '../../src/utils/responsive';

export default function TabLayout() {
  // Get responsive sizes
  const tabHeight = tabBarSizes.height;
  const tabFontSize = tabBarSizes.fontSize;
  const tabIconSize = tabBarSizes.iconSize;
  const headerHeight = headerSizes.height;
  const headerFontSize = headerSizes.fontSize;
  const headerIconSize = headerSizes.iconSize;

  return (
    <View
      style={{ flex: 1 }}
      accessible={true}
      accessibilityRole="tablist"
      accessibilityLabel="Main navigation"
    >
      <Tabs
      screenOptions={{
        // DISABLE ALL ANIMATIONS AND BOUNCE EFFECTS
        tabBarActiveTintColor: '#667eea', // Sky blue from welcome page
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: Platform.select({
          ios: {
            backgroundColor: 'transparent',
            borderTopWidth: 0,
            paddingBottom: tabBarSizes.paddingBottom,
            height: tabHeight + (Platform.OS === 'ios' ? tabBarSizes.paddingBottom : 0),
            position: 'absolute',
          },
          default: {
            backgroundColor: '#FFFFFF',
            borderTopWidth: 1,
            borderTopColor: '#E5E7EB',
            paddingBottom: tabBarSizes.paddingBottom,
            height: tabHeight,
          },
        }),
        tabBarBackground: () => <TabBarBackground />,
        tabBarLabelStyle: {
          fontSize: tabFontSize,
          fontWeight: '600',
          marginBottom: isVerySmallDevice() ? 2 : 4,
        },
        tabBarIconStyle: {
          marginTop: isVerySmallDevice() ? 2 : 4,
        },
        // Enhanced animations handled by SwipeableTabWrapper
        headerStyle: {
          backgroundColor: '#667eea', // Sky blue from welcome page
          elevation: 4,
          shadowOpacity: 0.3,
          height: headerHeight,
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: headerFontSize,
        },
        tabBarAccessibilityLabel: 'Main navigation tabs',
        // tabBarAccessibilityRole: 'tablist', // Remove unsupported property
      }}
    >
      {/* Chats Tab */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Chats',
          tabBarIcon: ({ color }) => (
            <Ionicons
              name="chatbubbles"
              size={tabIconSize}
              color={color}
              accessibilityLabel="Chats tab icon"
            />
          ),
          tabBarAccessibilityLabel: 'Chats tab',
          // tabBarAccessibilityRole: 'tab', // Remove unsupported property
          headerTitle: 'IraChat',
          headerLeft: () => (
            <Image
              source={require('../../assets/images/LOGO.png')}
              style={{
                width: headerIconSize,
                height: headerIconSize,
                marginLeft: headerSizes.paddingHorizontal,
                borderRadius: headerIconSize / 2
              }}
              resizeMode="cover"
            />
          ),

        }}
      />

      {/* Groups Tab */}
      <Tabs.Screen
        name="groups"
        options={{
          title: 'Groups',
          tabBarIcon: ({ color }) => (
            <Ionicons
              name="people"
              size={tabIconSize}
              color={color}
              accessibilityLabel="Groups tab icon"
            />
          ),
          tabBarAccessibilityLabel: 'Groups tab',
          // tabBarAccessibilityRole: 'tab', // Remove unsupported property
          headerTitle: 'Groups',
          // Clean header - no icons, create group functionality is in the floating action button
        }}
      />

      {/* Updates Tab */}
      <Tabs.Screen
        name="updates"
        options={{
          title: 'Updates',
          tabBarIcon: ({ color }) => (
            <Ionicons
              name="radio-button-on"
              size={tabIconSize}
              color={color}
              accessibilityLabel="Updates tab icon"
            />
          ),
          tabBarAccessibilityLabel: 'Updates tab',
          // tabBarAccessibilityRole: 'tab', // Remove unsupported property
          headerTitle: 'Updates',
          // NO headerRight - no search icon in updates topbar as per requirements
        }}
      />

      {/* Calls Tab */}
      <Tabs.Screen
        name="calls"
        options={{
          title: 'Calls',
          tabBarIcon: ({ color }) => (
            <Ionicons
              name="call"
              size={tabIconSize}
              color={color}
              accessibilityLabel="Calls tab icon"
            />
          ),
          tabBarAccessibilityLabel: 'Calls tab',
          // tabBarAccessibilityRole: 'tab', // Remove unsupported property
          headerTitle: 'Calls',

        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <Ionicons
              name="person"
              size={tabIconSize}
              color={color}
              accessibilityLabel="Profile tab icon"
            />
          ),
          tabBarAccessibilityLabel: 'Profile tab',
          // tabBarAccessibilityRole: 'tab', // Remove unsupported property
          headerTitle: 'Profile',
        }}
      />
    </Tabs>
    </View>
  );
}
