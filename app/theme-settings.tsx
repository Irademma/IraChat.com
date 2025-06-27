import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";

interface ThemeSettings {
  theme: "light" | "dark" | "auto";
  accentColor: string;
  fontSize: "small" | "medium" | "large";
  chatWallpaper: string;
  bubbleStyle: "rounded" | "square" | "minimal";
}

const defaultSettings: ThemeSettings = {
  theme: "light",
  accentColor: "#3B82F6",
  fontSize: "medium",
  chatWallpaper: "default",
  bubbleStyle: "rounded",
};

const accentColors = [
  { name: "Blue", color: "#3B82F6" },
  { name: "Purple", color: "#8B5CF6" },
  { name: "Green", color: "#10B981" },
  { name: "Pink", color: "#EC4899" },
  { name: "Orange", color: "#F59E0B" },
  { name: "Red", color: "#EF4444" },
];

const wallpapers = [
  { name: "Default", value: "default" },
  { name: "Gradient Blue", value: "gradient-blue" },
  { name: "Gradient Purple", value: "gradient-purple" },
  { name: "Pattern", value: "pattern" },
  { name: "None", value: "none" },
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
      const savedSettings = await AsyncStorage.getItem("themeSettings");
      if (savedSettings) {
        setSettings({ ...defaultSettings, ...JSON.parse(savedSettings) });
      }
    } catch (error) {
      console.error("Error loading theme settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (newSettings: ThemeSettings) => {
    try {
      await AsyncStorage.setItem("themeSettings", JSON.stringify(newSettings));
      setSettings(newSettings);
      Alert.alert(
        "Success",
        "Theme settings saved! Restart the app to see changes.",
      );
    } catch (error) {
      console.error("Error saving theme settings:", error);
      Alert.alert("Error", "Failed to save settings. Please try again.");
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
    icon,
  }: {
    title: string;
    description: string;
    isSelected: boolean;
    onPress: () => void;
    icon: string;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: isSelected ? 'rgba(102, 126, 234, 0.1)' : '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 12,
        shadowColor: '#667eea',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 6,
        borderWidth: isSelected ? 2 : 1,
        borderColor: isSelected ? 'rgba(102, 126, 234, 0.3)' : 'rgba(102, 126, 234, 0.1)',
      }}
      activeOpacity={0.7}
    >
      <View style={{
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: isSelected ? 'rgba(102, 126, 234, 0.2)' : 'rgba(102, 126, 234, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
      }}>
        <Ionicons
          name={icon as any}
          size={24}
          color={isSelected ? "#667eea" : "#9CA3AF"}
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{
          fontSize: 16,
          fontWeight: '600',
          color: isSelected ? "#667eea" : "#374151",
          marginBottom: 4,
        }}>
          {title}
        </Text>
        <Text style={{
          fontSize: 14,
          color: isSelected ? "#667eea" : "#6B7280",
          lineHeight: 20,
        }}>
          {description}
        </Text>
      </View>
      {isSelected && (
        <Ionicons name="checkmark-circle" size={24} color="#667eea" />
      )}
    </TouchableOpacity>
  );

  const ColorOption = ({
    color,
    name,
    isSelected,
    onPress,
  }: {
    color: string;
    name: string;
    isSelected: boolean;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      style={{
        alignItems: 'center',
        backgroundColor: isSelected ? 'rgba(102, 126, 234, 0.1)' : '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginRight: 12,
        shadowColor: '#667eea',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderWidth: isSelected ? 2 : 1,
        borderColor: isSelected ? color : 'rgba(102, 126, 234, 0.1)',
        minWidth: 80,
      }}
      activeOpacity={0.7}
    >
      <View style={{
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: color,
        marginBottom: 8,
        shadowColor: color,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
      }} />
      <Text style={{
        fontSize: 12,
        fontWeight: isSelected ? '600' : '500',
        color: isSelected ? color : '#6B7280',
        textAlign: 'center',
      }}>
        {name}
      </Text>
      {isSelected && (
        <View style={{
          position: 'absolute',
          top: -4,
          right: -4,
          backgroundColor: '#FFFFFF',
          borderRadius: 12,
          padding: 2,
        }}>
          <Ionicons name="checkmark-circle" size={20} color={color} />
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

  const insets = { top: 50, bottom: 0, left: 0, right: 0 }; // Fallback safe area

  return (
    <View style={{ flex: 1, backgroundColor: '#F0F9FF' }}>
      {/* Header with Safe Area and Gradient */}
      <View
        style={{
          backgroundColor: '#667eea',
          paddingTop: insets.top + 5,
          paddingBottom: 12,
          paddingHorizontal: 20,
          shadowColor: '#667eea',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ marginRight: 16, padding: 8 }}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={{
            fontSize: 20,
            fontWeight: 'bold',
            color: '#FFFFFF',
            marginTop: -3,
          }}>
            Theme & Appearance
          </Text>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingVertical: 25,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Theme Mode */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 20,
        }}>
          <Ionicons name="color-palette" size={24} color="#667eea" style={{ marginRight: 12 }} />
          <Text style={{
            fontSize: 20,
            fontWeight: 'bold',
            color: '#374151',
          }}>
            Theme Mode
          </Text>
        </View>

        <ThemeOption
          title="Light Mode"
          description="Use light theme"
          isSelected={settings.theme === "light"}
          onPress={() => updateSetting("theme", "light")}
          icon="sunny"
        />

        <ThemeOption
          title="Dark Mode"
          description="Use dark theme"
          isSelected={settings.theme === "dark"}
          onPress={() => updateSetting("theme", "dark")}
          icon="moon"
        />

        <ThemeOption
          title="Auto"
          description="Follow system theme"
          isSelected={settings.theme === "auto"}
          onPress={() => updateSetting("theme", "auto")}
          icon="phone-portrait"
        />

        {/* Accent Color */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 20,
          marginTop: 30,
        }}>
          <Ionicons name="color-filter" size={24} color="#667eea" style={{ marginRight: 12 }} />
          <Text style={{
            fontSize: 20,
            fontWeight: 'bold',
            color: '#374151',
          }}>
            Accent Color
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-4"
        >
          {accentColors.map((colorOption) => (
            <ColorOption
              key={colorOption.color}
              color={colorOption.color}
              name={colorOption.name}
              isSelected={settings.accentColor === colorOption.color}
              onPress={() => updateSetting("accentColor", colorOption.color)}
            />
          ))}
        </ScrollView>

        {/* Font Size */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 20,
          marginTop: 30,
        }}>
          <Ionicons name="text" size={24} color="#667eea" style={{ marginRight: 12 }} />
          <Text style={{
            fontSize: 20,
            fontWeight: 'bold',
            color: '#374151',
          }}>
            Font Size
          </Text>
        </View>

        <ThemeOption
          title="Small"
          description="Compact text size"
          isSelected={settings.fontSize === "small"}
          onPress={() => updateSetting("fontSize", "small")}
          icon="contract"
        />

        <ThemeOption
          title="Medium"
          description="Default text size"
          isSelected={settings.fontSize === "medium"}
          onPress={() => updateSetting("fontSize", "medium")}
          icon="resize"
        />

        <ThemeOption
          title="Large"
          description="Larger text for better readability"
          isSelected={settings.fontSize === "large"}
          onPress={() => updateSetting("fontSize", "large")}
          icon="expand"
        />

        {/* Chat Wallpaper */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 20,
          marginTop: 30,
        }}>
          <Ionicons name="image" size={24} color="#667eea" style={{ marginRight: 12 }} />
          <Text style={{
            fontSize: 20,
            fontWeight: 'bold',
            color: '#374151',
          }}>
            Chat Wallpaper
          </Text>
        </View>

        {wallpapers.map((wallpaper) => (
          <ThemeOption
            key={wallpaper.value}
            title={wallpaper.name}
            description={`Use ${wallpaper.name.toLowerCase()} wallpaper`}
            isSelected={settings.chatWallpaper === wallpaper.value}
            onPress={() => updateSetting("chatWallpaper", wallpaper.value)}
            icon="image"
          />
        ))}

        {/* Bubble Style */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 20,
          marginTop: 30,
        }}>
          <Ionicons name="chatbubble" size={24} color="#667eea" style={{ marginRight: 12 }} />
          <Text style={{
            fontSize: 20,
            fontWeight: 'bold',
            color: '#374151',
          }}>
            Message Bubble Style
          </Text>
        </View>

        <ThemeOption
          title="Rounded"
          description="Rounded message bubbles"
          isSelected={settings.bubbleStyle === "rounded"}
          onPress={() => updateSetting("bubbleStyle", "rounded")}
          icon="chatbubble"
        />

        <ThemeOption
          title="Square"
          description="Square message bubbles"
          isSelected={settings.bubbleStyle === "square"}
          onPress={() => updateSetting("bubbleStyle", "square")}
          icon="square"
        />

        <ThemeOption
          title="Minimal"
          description="Minimal message bubbles"
          isSelected={settings.bubbleStyle === "minimal"}
          onPress={() => updateSetting("bubbleStyle", "minimal")}
          icon="remove"
        />

        {/* Reset Button */}
        <TouchableOpacity
          onPress={() => {
            Alert.alert(
              "Reset Theme",
              "Are you sure you want to reset all theme settings to default?",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Reset",
                  style: "destructive",
                  onPress: () => saveSettings(defaultSettings),
                },
              ],
            );
          }}
          className="bg-red-50 border border-red-200 py-3 px-4 rounded-lg mt-6"
        >
          <Text className="text-red-600 text-center font-medium">
            Reset to Default
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
