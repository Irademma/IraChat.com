import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { Keyboard, Platform, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ErrorBoundary from "../../src/components/ErrorBoundary";
import { SwipeTabNavigator } from "../../src/components/SwipeTabNavigator";
import TabBarBackground from "../../src/components/ui/TabBarBackground";
import {
  headerSizes,
  isVerySmallDevice,
  tabBarSizes,
} from "../../src/utils/responsive";

export default function TabLayout() {
  // Get safe area insets
  const insets = useSafeAreaInsets();

  // Get keyboard visibility for tab bar
  const [shouldHideTabBar, setShouldHideTabBar] = React.useState(false);

  // Listen to keyboard events
  React.useEffect(() => {
    const keyboardWillShow = () => setShouldHideTabBar(true);
    const keyboardWillHide = () => setShouldHideTabBar(false);
    const keyboardDidShow = () => setShouldHideTabBar(true);
    const keyboardDidHide = () => setShouldHideTabBar(false);

    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showListener = Keyboard.addListener(showEvent, keyboardWillShow);
    const hideListener = Keyboard.addListener(hideEvent, keyboardWillHide);
    const didShowListener = Keyboard.addListener('keyboardDidShow', keyboardDidShow);
    const didHideListener = Keyboard.addListener('keyboardDidHide', keyboardDidHide);

    return () => {
      showListener?.remove();
      hideListener?.remove();
      didShowListener?.remove();
      didHideListener?.remove();
    };
  }, []);

  // Get responsive sizes
  const tabHeight = tabBarSizes.height;
  const tabFontSize = tabBarSizes.fontSize;
  const tabIconSize = tabBarSizes.iconSize;
  const headerHeight = headerSizes.height;
  const headerFontSize = headerSizes.fontSize;
  const headerIconSize = headerSizes.iconSize;

  return (
    <ErrorBoundary>
      <SwipeTabNavigator>
        <View
          style={{ flex: 1 }}
          accessible={true}
          accessibilityRole="tablist"
          accessibilityLabel="Main navigation"
        >
        <Tabs
        screenOptions={{
          // OPTIMIZED FOR PERFORMANCE - Reduced animations and faster loading
          tabBarActiveTintColor: "#667eea", // IraChat primary color - improved contrast
          tabBarInactiveTintColor: "#9CA3AF", // Better gray for inactive tabs
          lazy: false, // Disable lazy loading for faster tab switching
          // animationEnabled is not a valid option for bottom tabs
          tabBarStyle: Platform.select({
            ios: {
              backgroundColor: "transparent",
              borderTopWidth: 0,
              paddingBottom: Math.max(
                insets.bottom + 8,
                tabBarSizes.paddingBottom + 8,
              ), // Increased padding
              height:
                tabHeight +
                Math.max(insets.bottom + 8, tabBarSizes.paddingBottom + 8),
              position: "absolute",
              // Hide tab bar when keyboard is visible
              display: shouldHideTabBar ? 'none' : 'flex',
            },
            default: {
              backgroundColor: "#FFFFFF",
              borderTopWidth: 1,
              borderTopColor: "#E5E7EB",
              paddingBottom: Math.max(
                insets.bottom + 8,
                tabBarSizes.paddingBottom + 8,
              ), // Increased padding
              height: tabHeight + Math.max(insets.bottom + 8, 16), // Increased height
              // Hide tab bar when keyboard is visible
              display: shouldHideTabBar ? 'none' : 'flex',
            },
          }),
          tabBarBackground: () => <TabBarBackground />,
          tabBarLabelStyle: {
            fontSize: tabFontSize,
            fontWeight: "600",
            marginBottom: isVerySmallDevice() ? 2 : 4,
          },
          tabBarIconStyle: {
            marginTop: isVerySmallDevice() ? 2 : 4,
          },
          tabBarItemStyle: {
            borderRadius: 12,
            marginHorizontal: 4,
            paddingVertical: 4,
          },
          // Enhanced animations handled by SwipeableTabWrapper
          headerStyle: {
            backgroundColor: "#667eea", // Sky blue from welcome page
            elevation: 4,
            shadowOpacity: 0.3,
            height: headerHeight + insets.top,
            borderBottomWidth: 1,
            borderBottomColor: "rgba(255, 255, 255, 0.1)",
          },
          headerTitleContainerStyle: {
            paddingTop: insets.top, // Move paddingTop here to avoid warning
            justifyContent: "center", // Vertically center the title
            alignItems: "center", // Horizontally center the title
          },
          headerTintColor: "#FFFFFF",
          headerTitleStyle: {
            fontWeight: "bold",
            fontSize: headerFontSize,
            textAlign: "center", // Center text alignment
          },
          tabBarAccessibilityLabel: "Main navigation tabs",
          // tabBarAccessibilityRole: 'tablist', // Remove unsupported property
        }}
      >
        {/* Chats Tab */}
        <Tabs.Screen
          name="index"
          options={{
            title: "Chats",
            tabBarIcon: ({ color }) => (
              <Ionicons
                name="chatbubbles"
                size={tabIconSize}
                color={color}
                accessibilityLabel="Chats tab icon"
              />
            ),
            tabBarAccessibilityLabel: "Chats tab",
            headerShown: false, // Hide default header since we use custom MainHeader
          }}
        />

        {/* Groups Tab */}
        <Tabs.Screen
          name="groups"
          options={{
            title: "Groups",
            tabBarIcon: ({ color }) => (
              <Ionicons
                name="people"
                size={tabIconSize}
                color={color}
                accessibilityLabel="Groups tab icon"
              />
            ),
            tabBarAccessibilityLabel: "Groups tab",
            headerShown: false, // Hide default header since we use custom GroupsHeader
          }}
        />

        {/* Updates Tab */}
        <Tabs.Screen
          name="updates"
          options={{
            title: "Updates",
            tabBarIcon: ({ color }) => (
              <Ionicons
                name="radio-button-on"
                size={tabIconSize}
                color={color}
                accessibilityLabel="Updates tab icon"
              />
            ),
            tabBarAccessibilityLabel: "Updates tab",
            headerShown: false, // Hide default header since we use custom MainHeader
          }}
        />

        {/* Calls Tab */}
        <Tabs.Screen
          name="calls"
          options={{
            title: "Calls",
            tabBarIcon: ({ color }) => (
              <Ionicons
                name="call"
                size={tabIconSize}
                color={color}
                accessibilityLabel="Calls tab icon"
              />
            ),
            tabBarAccessibilityLabel: "Calls tab",
            headerShown: false, // Hide default header for consistency
          }}
        />

        {/* Settings Tab - Hidden from tab bar, accessible via menu */}
        <Tabs.Screen
          name="settings"
          options={{
            href: null, // Hide from tab bar
            headerShown: false, // Hide default header for consistency
          }}
        />

        {/* Profile tab removed - use separate profile.tsx in app root instead */}
        </Tabs>
        </View>
      </SwipeTabNavigator>
    </ErrorBoundary>
  );
}
