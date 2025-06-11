import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../src/redux/store';

export default function ProfileScreen() {
  const router = useRouter();
  const currentUser = useSelector((state: RootState) => state.user.currentUser);

  const handleEditProfile = () => {
    router.push('/edit-profile');
  };

  const handleSettings = () => {
    Alert.alert('Settings', 'Settings screen coming soon!');
  };

  const handlePrivacy = () => {
    Alert.alert('Privacy', 'Privacy settings coming soon!');
  };

  const handleNotifications = () => {
    router.push('/notifications-settings');
  };

  const handleHelp = () => {
    Alert.alert('Help', 'Help & Support coming soon!');
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
          onPress: () => {
            // In a real app, this would clear user data and navigate to auth
            Alert.alert('Logged Out', 'You have been logged out successfully');
          }
        }
      ]
    );
  };

  return (
    <ScrollView 
      className="flex-1 bg-gray-50"
      accessible={true}
      accessibilityLabel="Profile screen"
    >
      {/* Header */}
      <View className="bg-white px-4 py-6 border-b border-gray-200">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="mr-4"
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-900">
            Profile
          </Text>
        </View>
      </View>

      {/* Profile Info */}
      <View className="bg-white mx-4 mt-4 rounded-lg p-6 shadow-sm">
        <View className="items-center">
          {/* Avatar */}
          <View className="relative">
            <Image
              source={{ 
                uri: currentUser?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200'
              }}
              className="w-24 h-24 rounded-full"
              resizeMode="cover"
            />
            <TouchableOpacity
              onPress={handleEditProfile}
              className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-500 rounded-full items-center justify-center"
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Edit profile picture"
            >
              <Ionicons name="camera" size={16} color="white" />
            </TouchableOpacity>
          </View>

          {/* User Info */}
          <Text className="text-xl font-bold text-gray-900 mt-4">
            {currentUser?.name || 'User Name'}
          </Text>
          <Text className="text-gray-500 mt-1">
            {currentUser?.phoneNumber || '+256 XXX XXX XXX'}
          </Text>
          {currentUser?.bio && (
            <Text className="text-gray-600 text-center mt-2">
              {currentUser.bio}
            </Text>
          )}

          {/* Edit Profile Button */}
          <TouchableOpacity
            onPress={handleEditProfile}
            className="mt-4 px-6 py-2 bg-blue-500 rounded-full"
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Edit profile"
          >
            <Text className="text-white font-medium">
              Edit Profile
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Menu Options */}
      <View className="bg-white mx-4 mt-4 rounded-lg shadow-sm">
        {/* Settings */}
        <TouchableOpacity
          onPress={handleSettings}
          className="flex-row items-center px-4 py-4 border-b border-gray-100"
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Settings"
        >
          <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3">
            <Ionicons name="settings-outline" size={20} color="#6B7280" />
          </View>
          <Text className="flex-1 text-gray-900 font-medium">
            Settings
          </Text>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        {/* Privacy */}
        <TouchableOpacity
          onPress={handlePrivacy}
          className="flex-row items-center px-4 py-4 border-b border-gray-100"
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Privacy"
        >
          <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3">
            <Ionicons name="shield-outline" size={20} color="#6B7280" />
          </View>
          <Text className="flex-1 text-gray-900 font-medium">
            Privacy
          </Text>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        {/* Notifications */}
        <TouchableOpacity
          onPress={handleNotifications}
          className="flex-row items-center px-4 py-4 border-b border-gray-100"
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Notifications"
        >
          <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3">
            <Ionicons name="notifications-outline" size={20} color="#6B7280" />
          </View>
          <Text className="flex-1 text-gray-900 font-medium">
            Notifications
          </Text>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        {/* Help */}
        <TouchableOpacity
          onPress={handleHelp}
          className="flex-row items-center px-4 py-4"
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Help and Support"
        >
          <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3">
            <Ionicons name="help-circle-outline" size={20} color="#6B7280" />
          </View>
          <Text className="flex-1 text-gray-900 font-medium">
            Help & Support
          </Text>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      {/* Logout */}
      <View className="bg-white mx-4 mt-4 rounded-lg shadow-sm">
        <TouchableOpacity
          onPress={handleLogout}
          className="flex-row items-center px-4 py-4"
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Logout"
        >
          <View className="w-10 h-10 bg-red-100 rounded-full items-center justify-center mr-3">
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          </View>
          <Text className="flex-1 text-red-500 font-medium">
            Logout
          </Text>
        </TouchableOpacity>
      </View>

      {/* App Info */}
      <View className="items-center py-6">
        <Text className="text-gray-400 text-sm">
          IraChat v1.0.0
        </Text>
        <Text className="text-gray-400 text-xs mt-1">
          Made with ❤️ in Uganda
        </Text>
      </View>
    </ScrollView>
  );
}
