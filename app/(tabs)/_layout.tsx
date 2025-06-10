
import { Tabs } from 'expo-router';
import { Image, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import TabBarBackground from '../../src/components/ui/TabBarBackground';
export default function TabLayout() {

  return (
      <Tabs
      screenOptions={{
        // DISABLE ALL ANIMATIONS AND BOUNCE EFFECTS
        tabBarActiveTintColor: '#667eea', // Sky blue from welcome page
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: Platform.select({
          ios: {
            backgroundColor: 'transparent',
            borderTopWidth: 0,
            paddingBottom: 20,
            height: 85,
            position: 'absolute',
          },
          default: {
            backgroundColor: '#FFFFFF',
            borderTopWidth: 1,
            borderTopColor: '#E5E7EB',
            paddingBottom: 5,
            height: 65,
          },
        }),
        tabBarBackground: () => <TabBarBackground />,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        // Enhanced animations handled by SwipeableTabWrapper
        headerStyle: {
          backgroundColor: '#667eea', // Sky blue from welcome page
          elevation: 4,
          shadowOpacity: 0.3,
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 20,
        },
      }}
    >
      {/* Chats Tab */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Chats',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubbles" size={size} color={color} />
          ),
          headerTitle: 'IraChat',
          headerLeft: () => (
            <Image
              source={require('../../assets/images/LOGO.png')}
              style={{
                width: 32,
                height: 32,
                marginLeft: 15,
                borderRadius: 16
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
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" size={size} color={color} />
          ),
          headerTitle: 'Groups',
          // Clean header - no icons, create group functionality is in the floating action button
        }}
      />

      {/* Updates Tab */}
      <Tabs.Screen
        name="updates"
        options={{
          title: 'Updates',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="radio-button-on" size={size} color={color} />
          ),
          headerTitle: 'Updates',
          // NO headerRight - no search icon in updates topbar as per requirements
        }}
      />

      {/* Calls Tab */}
      <Tabs.Screen
        name="calls"
        options={{
          title: 'Calls',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="call" size={size} color={color} />
          ),
          headerTitle: 'Calls',

        }}
      />
    </Tabs>
  );
}
