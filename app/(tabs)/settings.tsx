import { signOut } from 'firebase/auth';
import { Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../src/redux/store';
import { logout } from '../../src/redux/userSlice';
import { auth } from '../../src/services/firebaseSimple';

export default function SettingsScreen() {
  const dispatch = useDispatch();

  // Get current user from Redux store
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const isAuthenticated = useSelector((state: RootState) => state.user.isAuthenticated);

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
              await signOut(auth);
              dispatch(logout());
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ]
    );
  };

  const settingsOptions = [
    {
      title: 'Account',
      icon: require('../../assets/images/profile.png'),
      onPress: () => router.push('/account-settings'),
    },
    {
      title: 'Notifications',
      icon: require('../../assets/images/notification.png'),
      onPress: () => router.push('/notifications-settings'),
    },
    {
      title: 'Privacy',
      icon: require('../../assets/images/setting.png'),
      onPress: () => router.push('/privacy-settings'),
    },
    {
      title: 'Theme & Appearance',
      icon: require('../../assets/images/setting.png'),
      onPress: () => router.push('/theme-settings'),
    },
    {
      title: 'Help & Support',
      icon: require('../../assets/images/comment.png'),
      onPress: () => router.push('/help-support'),
    },
    {
      title: 'Firebase Test',
      icon: require('../../assets/images/setting.png'),
      onPress: () => router.push('/firebase-test'),
    },
    {
      title: 'Responsive Test',
      icon: require('../../assets/images/setting.png'),
      onPress: () => router.push('/responsive-test'),
    },
  ];

  // Show loading state if user data is not available
  if (!isAuthenticated || !currentUser) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <Text className="text-gray-500 text-lg">Loading settings...</Text>
        <Text className="text-gray-400 text-sm mt-2">Please wait while we load your information</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white">
      {/* User Info Section */}
      <View className="bg-blue-500 px-6 py-8">
        <View className="items-center">
          <View className="w-20 h-20 bg-white rounded-full items-center justify-center mb-3">
            <Image
              source={require('../../assets/images/user-profile.webp')}
              className="w-16 h-16 rounded-full"
              resizeMode="cover"
            />
          </View>
          <Text
            className="text-white text-xl"
            style={{ fontWeight: '700' }}
          >
            {currentUser?.displayName || currentUser?.name || 'User'}
          </Text>
          <Text className="text-blue-100 text-sm mt-1">
            {currentUser?.email || 'No email set'}
          </Text>
          <Text className="text-blue-200 text-xs mt-2">
            {currentUser?.status || 'I Love IraChat'}
          </Text>
        </View>
      </View>

      {/* Settings Options */}
      <View className="px-4 py-6">
        {settingsOptions.map((option, index) => (
          <TouchableOpacity
            key={index}
            onPress={option.onPress}
            className="flex-row items-center py-4 px-4 bg-gray-50 rounded-lg mb-3"
          >
            <Image
              source={option.icon}
              className="w-6 h-6 mr-4"
              style={{ tintColor: '#6B7280' }}
              resizeMode="contain"
            />
            <Text
              className="text-gray-800 text-base flex-1"
              style={{ fontWeight: '500' }}
            >
              {option.title}
            </Text>
            <Text className="text-gray-400 text-lg">›</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* App Info */}
      <View className="px-4 py-4 border-t border-gray-200">
        <View className="items-center mb-6">
          <Image
            source={require('../../assets/images/LOGO.png')}
            className="w-16 h-16 mb-2"
            resizeMode="contain"
          />
          <Text className="text-gray-600 text-sm">IraChat v1.0.0</Text>
          <Text className="text-gray-400 text-xs mt-1">
            Secure messaging for everyone
          </Text>
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
