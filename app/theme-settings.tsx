import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ThemeSettings {
  theme: 'light' | 'dark' | 'auto';
  accentColor: string;
  fontSize: 'small' | 'medium' | 'large';
  chatWallpaper: string;
  bubbleStyle: 'rounded' | 'square' | 'minimal';
}

const defaultSettings: ThemeSettings = {
  theme: 'light',
  accentColor: '#3B82F6',
  fontSize: 'medium',
  chatWallpaper: 'default',
  bubbleStyle: 'rounded',
};

const accentColors = [
  { name: 'Blue', color: '#3B82F6' },
  { name: 'Purple', color: '#8B5CF6' },
  { name: 'Green', color: '#10B981' },
  { name: 'Pink', color: '#EC4899' },
  { name: 'Orange', color: '#F59E0B' },
  { name: 'Red', color: '#EF4444' },
];

const wallpapers = [
  { name: 'Default', value: 'default' },
  { name: 'Gradient Blue', value: 'gradient-blue' },
  { name: 'Gradient Purple', value: 'gradient-purple' },
  { name: 'Pattern', value: 'pattern' },
  { name: 'None', value: 'none' },
];

export default function ThemeSettingsScreen() {
  const router = useRouter();
  const [settings, setSettings] = useState<ThemeSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('themeSettings');
      if (savedSettings) {
        setSettings({ ...defaultSettings, ...JSON.parse(savedSettings) });
      }
    } catch (error) {
      console.error('Error loading theme settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (newSettings: ThemeSettings) => {
    try {
      await AsyncStorage.setItem('themeSettings', JSON.stringify(newSettings));
      setSettings(newSettings);
      Alert.alert('Success', 'Theme settings saved! Restart the app to see changes.');
    } catch (error) {
      console.error('Error saving theme settings:', error);
      Alert.alert('Error', 'Failed to save settings. Please try again.');
    }
  };

  const updateSetting = (key: keyof ThemeSettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    saveSettings(newSettings);
  };

  const ThemeOption = ({ 
    title, 
    description, 
    isSelected, 
    onPress, 
    icon 
  }: {
    title: string;
    description: string;
    isSelected: boolean;
    onPress: () => void;
    icon: string;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      className={`flex-row items-center py-4 px-4 rounded-lg mb-3 ${
        isSelected ? 'bg-blue-50 border-2 border-blue-200' : 'bg-white border border-gray-200'
      }`}
    >
      <View className={`w-10 h-10 rounded-full items-center justify-center mr-4 ${
        isSelected ? 'bg-blue-100' : 'bg-gray-100'
      }`}>
        <Ionicons name={icon as any} size={20} color={isSelected ? '#3B82F6' : '#6B7280'} />
      </View>
      <View className="flex-1">
        <Text className={`text-base font-medium ${isSelected ? 'text-blue-800' : 'text-gray-800'}`}>
          {title}
        </Text>
        <Text className={`text-sm mt-1 ${isSelected ? 'text-blue-600' : 'text-gray-500'}`}>
          {description}
        </Text>
      </View>
      {isSelected && <Ionicons name="checkmark-circle" size={24} color="#3B82F6" />}
    </TouchableOpacity>
  );

  const ColorOption = ({ color, name, isSelected, onPress }: {
    color: string;
    name: string;
    isSelected: boolean;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      className={`items-center p-3 rounded-lg mr-3 ${
        isSelected ? 'bg-gray-100' : 'bg-white'
      }`}
    >
      <View 
        className="w-8 h-8 rounded-full mb-2"
        style={{ backgroundColor: color }}
      />
      <Text className={`text-xs ${isSelected ? 'text-gray-800 font-medium' : 'text-gray-600'}`}>
        {name}
      </Text>
      {isSelected && (
        <View className="absolute -top-1 -right-1">
          <Ionicons name="checkmark-circle" size={16} color="#3B82F6" />
        </View>
      )}
    </TouchableOpacity>
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
          <Text className="text-xl font-bold text-gray-800">Theme & Appearance</Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 py-6">
        {/* Theme Mode */}
        <Text className="text-lg font-semibold text-gray-800 mb-4">Theme Mode</Text>
        
        <ThemeOption
          title="Light Mode"
          description="Use light theme"
          isSelected={settings.theme === 'light'}
          onPress={() => updateSetting('theme', 'light')}
          icon="sunny"
        />

        <ThemeOption
          title="Dark Mode"
          description="Use dark theme"
          isSelected={settings.theme === 'dark'}
          onPress={() => updateSetting('theme', 'dark')}
          icon="moon"
        />

        <ThemeOption
          title="Auto"
          description="Follow system theme"
          isSelected={settings.theme === 'auto'}
          onPress={() => updateSetting('theme', 'auto')}
          icon="phone-portrait"
        />

        {/* Accent Color */}
        <Text className="text-lg font-semibold text-gray-800 mb-4 mt-6">Accent Color</Text>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
          {accentColors.map((colorOption) => (
            <ColorOption
              key={colorOption.color}
              color={colorOption.color}
              name={colorOption.name}
              isSelected={settings.accentColor === colorOption.color}
              onPress={() => updateSetting('accentColor', colorOption.color)}
            />
          ))}
        </ScrollView>

        {/* Font Size */}
        <Text className="text-lg font-semibold text-gray-800 mb-4 mt-6">Font Size</Text>

        <ThemeOption
          title="Small"
          description="Compact text size"
          isSelected={settings.fontSize === 'small'}
          onPress={() => updateSetting('fontSize', 'small')}
          icon="contract"
        />

        <ThemeOption
          title="Medium"
          description="Default text size"
          isSelected={settings.fontSize === 'medium'}
          onPress={() => updateSetting('fontSize', 'medium')}
          icon="resize"
        />

        <ThemeOption
          title="Large"
          description="Larger text for better readability"
          isSelected={settings.fontSize === 'large'}
          onPress={() => updateSetting('fontSize', 'large')}
          icon="expand"
        />

        {/* Chat Wallpaper */}
        <Text className="text-lg font-semibold text-gray-800 mb-4 mt-6">Chat Wallpaper</Text>

        {wallpapers.map((wallpaper) => (
          <ThemeOption
            key={wallpaper.value}
            title={wallpaper.name}
            description={`Use ${wallpaper.name.toLowerCase()} wallpaper`}
            isSelected={settings.chatWallpaper === wallpaper.value}
            onPress={() => updateSetting('chatWallpaper', wallpaper.value)}
            icon="image"
          />
        ))}

        {/* Bubble Style */}
        <Text className="text-lg font-semibold text-gray-800 mb-4 mt-6">Message Bubble Style</Text>

        <ThemeOption
          title="Rounded"
          description="Rounded message bubbles"
          isSelected={settings.bubbleStyle === 'rounded'}
          onPress={() => updateSetting('bubbleStyle', 'rounded')}
          icon="chatbubble"
        />

        <ThemeOption
          title="Square"
          description="Square message bubbles"
          isSelected={settings.bubbleStyle === 'square'}
          onPress={() => updateSetting('bubbleStyle', 'square')}
          icon="square"
        />

        <ThemeOption
          title="Minimal"
          description="Minimal message bubbles"
          isSelected={settings.bubbleStyle === 'minimal'}
          onPress={() => updateSetting('bubbleStyle', 'minimal')}
          icon="remove"
        />

        {/* Reset Button */}
        <TouchableOpacity
          onPress={() => {
            Alert.alert(
              'Reset Theme',
              'Are you sure you want to reset all theme settings to default?',
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
