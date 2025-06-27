import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function SettingsScreen() {
  const router = useRouter();
  
  // Settings state
  const [settings, setSettings] = useState({
    darkMode: false,
    autoDownloadMedia: true,
    saveToGallery: false,
    readReceipts: true,
    lastSeen: true,
    profilePhoto: true,
    about: true,
    status: true,
    groupsCommon: true,
    liveLocation: false,
    chatBackup: true,
    autoBackup: false,
    includeVideos: false,
    backupFrequency: 'daily',
    language: 'English',
    fontSize: 'Medium',
  });

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const settingSections = [
    {
      title: 'Appearance',
      items: [
        {
          title: 'Dark Mode',
          subtitle: 'Use dark theme',
          type: 'switch',
          key: 'darkMode',
          value: settings.darkMode,
        },
        {
          title: 'Language',
          subtitle: settings.language,
          type: 'select',
          key: 'language',
          options: ['English', 'Luganda', 'Swahili', 'French'],
        },
        {
          title: 'Font Size',
          subtitle: settings.fontSize,
          type: 'select',
          key: 'fontSize',
          options: ['Small', 'Medium', 'Large'],
        },
      ],
    },
    {
      title: 'Media',
      items: [
        {
          title: 'Auto-download Media',
          subtitle: 'Download photos and videos automatically',
          type: 'switch',
          key: 'autoDownloadMedia',
          value: settings.autoDownloadMedia,
        },
        {
          title: 'Save to Gallery',
          subtitle: 'Save received media to device gallery',
          type: 'switch',
          key: 'saveToGallery',
          value: settings.saveToGallery,
        },
      ],
    },
    {
      title: 'Privacy',
      items: [
        {
          title: 'Read Receipts',
          subtitle: 'Show when you\'ve read messages',
          type: 'switch',
          key: 'readReceipts',
          value: settings.readReceipts,
        },
        {
          title: 'Last Seen',
          subtitle: 'Show when you were last online',
          type: 'switch',
          key: 'lastSeen',
          value: settings.lastSeen,
        },
        {
          title: 'Profile Photo',
          subtitle: 'Who can see your profile photo',
          type: 'select',
          key: 'profilePhoto',
          options: ['Everyone', 'Contacts', 'Nobody'],
        },
      ],
    },
    {
      title: 'Backup',
      items: [
        {
          title: 'Chat Backup',
          subtitle: 'Backup your chats to cloud',
          type: 'switch',
          key: 'chatBackup',
          value: settings.chatBackup,
        },
        {
          title: 'Auto Backup',
          subtitle: 'Automatically backup chats',
          type: 'switch',
          key: 'autoBackup',
          value: settings.autoBackup,
        },
        {
          title: 'Include Videos',
          subtitle: 'Include videos in backup',
          type: 'switch',
          key: 'includeVideos',
          value: settings.includeVideos,
        },
      ],
    },
  ];

  const handleSelectOption = (key: string, options: string[]) => {
    Alert.alert(
      'Select Option',
      `Choose ${key}:`,
      [
        ...options.map(option => ({
          text: option,
          onPress: () => updateSetting(key, option),
        })),
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const renderSettingItem = (item: any) => (
    <TouchableOpacity
      key={item.key}
      onPress={() => {
        if (item.type === 'select') {
          handleSelectOption(item.key, item.options);
        }
      }}
      className="flex-row items-center px-4 py-4 border-b border-gray-100"
    >
      <View className="flex-1">
        <Text className="text-gray-900 font-medium text-base">
          {item.title}
        </Text>
        <Text className="text-gray-500 text-sm mt-1">
          {item.subtitle}
        </Text>
      </View>
      
      {item.type === 'switch' ? (
        <Switch
          value={item.value}
          onValueChange={(value) => updateSetting(item.key, value)}
          trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
          thumbColor={item.value ? '#FFFFFF' : '#FFFFFF'}
        />
      ) : (
        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 py-6 border-b border-gray-200">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="mr-4"
          >
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-900">Settings</Text>
        </View>
      </View>

      {/* Settings Sections */}
      {settingSections.map((section, index) => (
        <View key={index} className="bg-white mx-4 mt-4 rounded-lg shadow-sm">
          <View className="px-4 py-3 border-b border-gray-100">
            <Text className="text-gray-700 font-semibold text-sm uppercase tracking-wide">
              {section.title}
            </Text>
          </View>
          {section.items.map(renderSettingItem)}
        </View>
      ))}

      {/* Additional Options */}
      <View className="bg-white mx-4 mt-4 rounded-lg shadow-sm">
        <TouchableOpacity
          onPress={() => Alert.alert('Storage', 'Manage app storage and cache')}
          className="flex-row items-center px-4 py-4 border-b border-gray-100"
        >
          <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3">
            <Ionicons name="folder-outline" size={20} color="#6B7280" />
          </View>
          <Text className="flex-1 text-gray-900 font-medium">Storage</Text>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => Alert.alert('About', 'IraChat v1.0.0\nBuilt with React Native & Expo')}
          className="flex-row items-center px-4 py-4"
        >
          <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3">
            <Ionicons name="information-circle-outline" size={20} color="#6B7280" />
          </View>
          <Text className="flex-1 text-gray-900 font-medium">About</Text>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      <View className="h-8" />
    </ScrollView>
  );
}
