import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native';

interface NotificationSettings {
  messageNotifications: boolean;
  groupNotifications: boolean;
  callNotifications: boolean;
  updateNotifications: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  showPreview: boolean;
  quietHours: boolean;
  quietStart: string;
  quietEnd: string;
}

const defaultSettings: NotificationSettings = {
  messageNotifications: true,
  groupNotifications: true,
  callNotifications: true,
  updateNotifications: true,
  soundEnabled: true,
  vibrationEnabled: true,
  showPreview: true,
  quietHours: false,
  quietStart: '22:00',
  quietEnd: '07:00',
};

export default function NotificationsSettingsScreen() {
  const router = useRouter();
  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('notificationSettings');
      if (savedSettings) {
        setSettings({ ...defaultSettings, ...JSON.parse(savedSettings) });
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (newSettings: NotificationSettings) => {
    try {
      await AsyncStorage.setItem('notificationSettings', JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving notification settings:', error);
      Alert.alert('Error', 'Failed to save settings. Please try again.');
    }
  };

  const updateSetting = (key: keyof NotificationSettings, value: boolean | string) => {
    const newSettings = { ...settings, [key]: value };
    saveSettings(newSettings);
  };

  const SettingItem = ({ 
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
      <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center mr-4">
        <Ionicons name={icon as any} size={20} color="#3B82F6" />
      </View>
      <View className="flex-1">
        <Text className="text-gray-800 text-base font-medium">{title}</Text>
        <Text className="text-gray-500 text-sm mt-1">{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
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
          <Text className="text-xl font-bold text-gray-800">Notifications</Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 py-6">
        {/* Message Notifications */}
        <Text className="text-lg font-semibold text-gray-800 mb-4">Message Notifications</Text>
        
        <SettingItem
          title="Message Notifications"
          description="Get notified when you receive new messages"
          value={settings.messageNotifications}
          onToggle={(value) => updateSetting('messageNotifications', value)}
          icon="chatbubble"
        />

        <SettingItem
          title="Group Notifications"
          description="Get notified for group messages"
          value={settings.groupNotifications}
          onToggle={(value) => updateSetting('groupNotifications', value)}
          icon="people"
        />

        <SettingItem
          title="Call Notifications"
          description="Get notified for incoming calls"
          value={settings.callNotifications}
          onToggle={(value) => updateSetting('callNotifications', value)}
          icon="call"
        />

        <SettingItem
          title="Update Notifications"
          description="Get notified for status updates"
          value={settings.updateNotifications}
          onToggle={(value) => updateSetting('updateNotifications', value)}
          icon="refresh"
        />

        {/* Notification Style */}
        <Text className="text-lg font-semibold text-gray-800 mb-4 mt-6">Notification Style</Text>

        <SettingItem
          title="Sound"
          description="Play sound for notifications"
          value={settings.soundEnabled}
          onToggle={(value) => updateSetting('soundEnabled', value)}
          icon="volume-high"
        />

        <SettingItem
          title="Vibration"
          description="Vibrate for notifications"
          value={settings.vibrationEnabled}
          onToggle={(value) => updateSetting('vibrationEnabled', value)}
          icon="phone-portrait"
        />

        <SettingItem
          title="Show Preview"
          description="Show message content in notifications"
          value={settings.showPreview}
          onToggle={(value) => updateSetting('showPreview', value)}
          icon="eye"
        />

        {/* Quiet Hours */}
        <Text className="text-lg font-semibold text-gray-800 mb-4 mt-6">Quiet Hours</Text>

        <SettingItem
          title="Enable Quiet Hours"
          description="Mute notifications during specified hours"
          value={settings.quietHours}
          onToggle={(value) => updateSetting('quietHours', value)}
          icon="moon"
        />

        {settings.quietHours && (
          <View className="bg-white rounded-lg p-4 mb-3">
            <Text className="text-gray-600 text-sm mb-2">
              Quiet hours: {settings.quietStart} - {settings.quietEnd}
            </Text>
            <TouchableOpacity
              onPress={() => Alert.alert('Coming Soon', 'Time picker will be available soon')}
              className="bg-blue-50 py-2 px-4 rounded-lg"
            >
              <Text className="text-blue-600 text-center">Change Times</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Reset Button */}
        <TouchableOpacity
          onPress={() => {
            Alert.alert(
              'Reset Settings',
              'Are you sure you want to reset all notification settings to default?',
              [
                { text: 'Cancel', style: 'cancel' },
                { 
                  text: 'Reset', 
                  style: 'destructive',
                  onPress: () => saveSettings(defaultSettings)
                }
              ]
            );
          }}
          className="bg-red-50 border border-red-200 py-3 px-4 rounded-lg mt-6"
        >
          <Text className="text-red-600 text-center font-medium">Reset to Default</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
