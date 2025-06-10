import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface PrivacySettings {
  lastSeen: 'everyone' | 'contacts' | 'nobody';
  profilePhoto: 'everyone' | 'contacts' | 'nobody';
  status: 'everyone' | 'contacts' | 'nobody';
  readReceipts: boolean;
  groupsAddMe: 'everyone' | 'contacts' | 'nobody';
  liveLocation: boolean;
  callsFrom: 'everyone' | 'contacts' | 'nobody';
  blockedContacts: string[];
  twoStepVerification: boolean;
  disappearingMessages: boolean;
  screenshotNotification: boolean;
}

const defaultSettings: PrivacySettings = {
  lastSeen: 'everyone',
  profilePhoto: 'everyone',
  status: 'everyone',
  readReceipts: true,
  groupsAddMe: 'contacts',
  liveLocation: false,
  callsFrom: 'everyone',
  blockedContacts: [],
  twoStepVerification: false,
  disappearingMessages: false,
  screenshotNotification: true,
};

export default function PrivacySettingsScreen() {
  const router = useRouter();
  const [settings, setSettings] = useState<PrivacySettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('privacySettings');
      if (savedSettings) {
        setSettings({ ...defaultSettings, ...JSON.parse(savedSettings) });
      }
    } catch (error) {
      console.error('Error loading privacy settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (newSettings: PrivacySettings) => {
    try {
      await AsyncStorage.setItem('privacySettings', JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving privacy settings:', error);
      Alert.alert('Error', 'Failed to save settings. Please try again.');
    }
  };

  const updateSetting = (key: keyof PrivacySettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    saveSettings(newSettings);
  };

  const showPrivacyOptions = (title: string, currentValue: string, onSelect: (value: string) => void) => {
    Alert.alert(
      title,
      'Who can see this information?',
      [
        { text: 'Everyone', onPress: () => onSelect('everyone') },
        { text: 'My Contacts', onPress: () => onSelect('contacts') },
        { text: 'Nobody', onPress: () => onSelect('nobody') },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const PrivacyItem = ({ 
    title, 
    description, 
    value, 
    onPress, 
    icon 
  }: {
    title: string;
    description: string;
    value: string;
    onPress: () => void;
    icon: string;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center py-4 px-4 bg-white rounded-lg mb-3"
    >
      <View className="w-10 h-10 rounded-full bg-purple-100 items-center justify-center mr-4">
        <Ionicons name={icon as any} size={20} color="#8B5CF6" />
      </View>
      <View className="flex-1">
        <Text className="text-gray-800 text-base font-medium">{title}</Text>
        <Text className="text-gray-500 text-sm mt-1">{description}</Text>
      </View>
      <View className="flex-row items-center">
        <Text className="text-purple-600 text-sm mr-2 capitalize">{value}</Text>
        <Ionicons name="chevron-forward" size={16} color="#8B5CF6" />
      </View>
    </TouchableOpacity>
  );

  const SwitchItem = ({ 
    title, 
    description, 
    value, 
    onToggle, 
    icon 
  }: {
    title: string;
    description: string;
    value: boolean;
    onToggle: (value: boolean) => void;
    icon: string;
  }) => (
    <View className="flex-row items-center py-4 px-4 bg-white rounded-lg mb-3">
      <View className="w-10 h-10 rounded-full bg-purple-100 items-center justify-center mr-4">
        <Ionicons name={icon as any} size={20} color="#8B5CF6" />
      </View>
      <View className="flex-1">
        <Text className="text-gray-800 text-base font-medium">{title}</Text>
        <Text className="text-gray-500 text-sm mt-1">{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#E5E7EB', true: '#8B5CF6' }}
        thumbColor={value ? '#FFFFFF' : '#FFFFFF'}
      />
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <Text className="text-gray-500">Loading settings...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 py-4 border-b border-gray-200">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-800">Privacy & Security</Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 py-6">
        {/* Who Can See My Info */}
        <Text className="text-lg font-semibold text-gray-800 mb-4">Who Can See My Info</Text>
        
        <PrivacyItem
          title="Last Seen"
          description="Who can see when you were last online"
          value={settings.lastSeen}
          onPress={() => showPrivacyOptions('Last Seen', settings.lastSeen, (value) => updateSetting('lastSeen', value))}
          icon="time"
        />

        <PrivacyItem
          title="Profile Photo"
          description="Who can see your profile photo"
          value={settings.profilePhoto}
          onPress={() => showPrivacyOptions('Profile Photo', settings.profilePhoto, (value) => updateSetting('profilePhoto', value))}
          icon="person-circle"
        />

        <PrivacyItem
          title="Status"
          description="Who can see your status updates"
          value={settings.status}
          onPress={() => showPrivacyOptions('Status', settings.status, (value) => updateSetting('status', value))}
          icon="chatbubble-ellipses"
        />

        {/* Message Settings */}
        <Text className="text-lg font-semibold text-gray-800 mb-4 mt-6">Message Settings</Text>

        <SwitchItem
          title="Read Receipts"
          description="Let others know when you've read their messages"
          value={settings.readReceipts}
          onToggle={(value) => updateSetting('readReceipts', value)}
          icon="checkmark-done"
        />

        <SwitchItem
          title="Disappearing Messages"
          description="Messages disappear after being read"
          value={settings.disappearingMessages}
          onToggle={(value) => updateSetting('disappearingMessages', value)}
          icon="timer"
        />

        <SwitchItem
          title="Screenshot Notifications"
          description="Notify when someone screenshots your messages"
          value={settings.screenshotNotification}
          onToggle={(value) => updateSetting('screenshotNotification', value)}
          icon="camera"
        />

        {/* Groups & Calls */}
        <Text className="text-lg font-semibold text-gray-800 mb-4 mt-6">Groups & Calls</Text>

        <PrivacyItem
          title="Groups"
          description="Who can add you to groups"
          value={settings.groupsAddMe}
          onPress={() => showPrivacyOptions('Groups', settings.groupsAddMe, (value) => updateSetting('groupsAddMe', value))}
          icon="people"
        />

        <PrivacyItem
          title="Calls"
          description="Who can call you"
          value={settings.callsFrom}
          onPress={() => showPrivacyOptions('Calls', settings.callsFrom, (value) => updateSetting('callsFrom', value))}
          icon="call"
        />

        {/* Security */}
        <Text className="text-lg font-semibold text-gray-800 mb-4 mt-6">Security</Text>

        <SwitchItem
          title="Two-Step Verification"
          description="Add extra security to your account"
          value={settings.twoStepVerification}
          onToggle={(value) => {
            if (value) {
              Alert.alert('Two-Step Verification', 'This feature will be available soon');
            } else {
              updateSetting('twoStepVerification', value);
            }
          }}
          icon="shield-checkmark"
        />

        {/* Blocked Contacts */}
        <TouchableOpacity
          onPress={() => Alert.alert('Blocked Contacts', `You have ${settings.blockedContacts.length} blocked contacts`)}
          className="flex-row items-center py-4 px-4 bg-white rounded-lg mb-3"
        >
          <View className="w-10 h-10 rounded-full bg-red-100 items-center justify-center mr-4">
            <Ionicons name="ban" size={20} color="#EF4444" />
          </View>
          <View className="flex-1">
            <Text className="text-gray-800 text-base font-medium">Blocked Contacts</Text>
            <Text className="text-gray-500 text-sm mt-1">{settings.blockedContacts.length} contacts blocked</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#6B7280" />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
