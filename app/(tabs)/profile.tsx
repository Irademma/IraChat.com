import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useLogout } from '../../src/hooks/useAuthPersistence';
import { RootState } from '../../src/redux/store';

// Profile tabs configuration
const profileTabs = [
  {
    label: 'Chats',
    value: 'chats',
    icon: require('../../assets/images/comment.png'),
  },
  {
    label: 'Media',
    value: 'media',
    icon: require('../../assets/images/posts.png'),
  },
  {
    label: 'Settings',
    value: 'settings',
    icon: require('../../assets/images/setting.png'),
  },
];

export default function ProfileScreen() {
  const dispatch = useDispatch();
  const router = useRouter();

  // Get current user from Redux store
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const isAuthenticated = useSelector((state: RootState) => state.user.isAuthenticated);

  // Debug log to see what's in currentUser
  console.log('🔍 Profile: currentUser data:', currentUser);

  const [activeTab, setActiveTab] = useState('chats');
  const logoutUser = useLogout();

  const handleEditProfile = () => {
    router.push('/edit-profile');
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('🚪 Profile: Starting logout process...');
              await logoutUser();
              console.log('✅ Profile: Logout completed successfully');

              // Show success message
              Alert.alert(
                'Logged Out',
                'You have been successfully logged out.',
                [{ text: 'OK' }]
              );
            } catch (error) {
              console.error('❌ Profile: Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ]
    );
  };

  // Show loading or error state if user data is not available
  if (!isAuthenticated || !currentUser) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <Text className="text-gray-500 text-lg">Loading profile...</Text>
        <Text className="text-gray-400 text-sm mt-2">Please wait while we load your information</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white">
      {/* Profile Header */}
      <View className="bg-blue-500 px-6 py-8">
        <View className="items-center">
          <View className="w-24 h-24 bg-white rounded-full items-center justify-center mb-4">
            {currentUser?.avatar ? (
              <Image
                source={{ uri: currentUser.avatar }}
                className="w-20 h-20 rounded-full"
                resizeMode="cover"
              />
            ) : (
              <Text
                className="text-blue-500 text-2xl"
                style={{ fontWeight: '700' }}
              >
                {(currentUser?.name || 'U').charAt(0).toUpperCase()}
              </Text>
            )}
          </View>
          <Text
            className="text-white text-xl mb-1"
            style={{ fontWeight: '700' }}
          >
            {currentUser?.name || 'User'}
          </Text>

          {/* Username */}
          {currentUser?.username && (
            <Text className="text-blue-100 text-sm mb-1">
              {currentUser.username.startsWith('@') ? currentUser.username : `@${currentUser.username}`}
            </Text>
          )}

          <Text className="text-blue-100 text-sm">
            {currentUser?.phoneNumber}
          </Text>
          <Text className="text-blue-200 text-xs mt-2 text-center">
            {currentUser?.status || 'I Love IraChat'}
          </Text>
        </View>
      </View>

      {/* Profile Tabs */}
      <View className="mt-6">
        {/* Tab Headers */}
        <View className="flex-row bg-gray-50 mx-4 rounded-lg p-1">
          {profileTabs.map((tab) => (
            <TouchableOpacity
              key={tab.value}
              onPress={() => setActiveTab(tab.value)}
              className={`flex-1 flex-row items-center justify-center py-3 px-2 rounded-md ${
                activeTab === tab.value ? 'bg-white shadow-sm' : ''
              }`}
            >
              <Image
                source={tab.icon}
                className="w-4 h-4 mr-1"
                style={{
                  tintColor: activeTab === tab.value ? '#3B82F6' : '#6B7280'
                }}
                resizeMode="contain"
              />
              <Text
                className={`text-xs ${
                  activeTab === tab.value ? 'text-blue-500' : 'text-gray-600'
                }`}
                style={{ fontWeight: '500' }}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        <View className="mt-4 px-4">
          {activeTab === 'chats' && (
            <View className="bg-white rounded-lg p-6">
              <Text
                className="text-gray-800 text-lg mb-4"
                style={{ fontWeight: '600' }}
              >
                Recent Chats
              </Text>
              <View className="items-center py-8">
                <Image
                  source={require('../../assets/images/comment.png')}
                  className="w-16 h-16 mb-4"
                  style={{ tintColor: '#9CA3AF' }}
                  resizeMode="contain"
                />
                <Text className="text-gray-500 text-center">No recent chats</Text>
                <Text className="text-gray-400 text-sm text-center mt-1">
                  Start a conversation to see your chats here
                </Text>
              </View>
            </View>
          )}

          {activeTab === 'media' && (
            <View className="bg-white rounded-lg p-6">
              <Text
                className="text-gray-800 text-lg mb-4"
                style={{ fontWeight: '600' }}
              >
                Shared Media
              </Text>
              <View className="items-center py-8">
                <Image
                  source={require('../../assets/images/posts.png')}
                  className="w-16 h-16 mb-4"
                  style={{ tintColor: '#9CA3AF' }}
                  resizeMode="contain"
                />
                <Text className="text-gray-500 text-center">No media shared</Text>
                <Text className="text-gray-400 text-sm text-center mt-1">
                  Photos and videos you share will appear here
                </Text>
              </View>
            </View>
          )}

          {activeTab === 'settings' && (
            <View className="bg-white rounded-lg p-4">
              <Text
                className="text-gray-800 text-lg mb-4"
                style={{ fontWeight: '600' }}
              >
                Settings
              </Text>

              <TouchableOpacity
                onPress={handleEditProfile}
                className="flex-row items-center py-4 border-b border-gray-100"
              >
                <Image
                  source={require('../../assets/images/profile.png')}
                  className="w-6 h-6 mr-4"
                  style={{ tintColor: '#6B7280' }}
                  resizeMode="contain"
                />
                <Text className="text-gray-800 text-base flex-1">Edit Profile</Text>
                <Text className="text-gray-400 text-lg">›</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push('/notifications-settings')}
                className="flex-row items-center py-4 border-b border-gray-100"
              >
                <Image
                  source={require('../../assets/images/notification.png')}
                  className="w-6 h-6 mr-4"
                  style={{ tintColor: '#6B7280' }}
                  resizeMode="contain"
                />
                <Text className="text-gray-800 text-base flex-1">Notifications</Text>
                <Text className="text-gray-400 text-lg">›</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push('/privacy-settings')}
                className="flex-row items-center py-4"
              >
                <Image
                  source={require('../../assets/images/setting.png')}
                  className="w-6 h-6 mr-4"
                  style={{ tintColor: '#6B7280' }}
                  resizeMode="contain"
                />
                <Text className="text-gray-800 text-base flex-1">Privacy</Text>
                <Text className="text-gray-400 text-lg">›</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* App Info */}
      <View className="px-4 py-4 border-t border-gray-200">
        <View className="items-center mb-6">
          <Image
            source={require('../../assets/images/LOGO.png')}
            className="w-12 h-12 mb-2"
            resizeMode="contain"
          />
          <Text className="text-gray-600 text-sm">IraChat v1.0.0</Text>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          onPress={handleLogout}
          className="bg-red-500 py-3 px-6 rounded-lg mx-4"
        >
          <Text
            className="text-white text-center text-base"
            style={{ fontWeight: '600' }}
          >
            Logout
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
