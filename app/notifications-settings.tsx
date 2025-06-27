import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    Alert,
    ScrollView,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

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
  quietStart: "22:00",
  quietEnd: "07:00",
};

export default function NotificationsSettingsScreen() {
  const router = useRouter();
  const [settings, setSettings] =
    useState<NotificationSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem("notificationSettings");
      if (savedSettings) {
        setSettings({ ...defaultSettings, ...JSON.parse(savedSettings) });
      }
    } catch (error) {
      console.error("Error loading notification settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (newSettings: NotificationSettings) => {
    try {
      await AsyncStorage.setItem(
        "notificationSettings",
        JSON.stringify(newSettings),
      );
      setSettings(newSettings);
    } catch (error) {
      console.error("Error saving notification settings:", error);
      Alert.alert("Error", "Failed to save settings. Please try again.");
    }
  };

  const updateSetting = (
    key: keyof NotificationSettings,
    value: boolean | string,
  ) => {
    const newSettings = { ...settings, [key]: value };
    saveSettings(newSettings);
  };

  const handleQuietHoursChange = () => {
    const timeOptions = [
      "20:00", "21:00", "22:00", "23:00", "00:00", "01:00", "02:00"
    ];
    const endTimeOptions = [
      "05:00", "06:00", "07:00", "08:00", "09:00", "10:00"
    ];

    Alert.alert(
      "Set Quiet Hours",
      "Choose your quiet hours start and end times:",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Set Start Time",
          onPress: () => {
            Alert.alert(
              "Start Time",
              "When should quiet hours begin?",
              [
                ...timeOptions.map(time => ({
                  text: time,
                  onPress: () => {
                    updateSetting("quietStart", time);
                    // After setting start time, ask for end time
                    setTimeout(() => {
                      Alert.alert(
                        "End Time",
                        "When should quiet hours end?",
                        [
                          ...endTimeOptions.map(endTime => ({
                            text: endTime,
                            onPress: () => updateSetting("quietEnd", endTime),
                          })),
                          { text: "Cancel", style: "cancel" },
                        ]
                      );
                    }, 100);
                  },
                })),
                { text: "Cancel", style: "cancel" },
              ]
            );
          },
        },
      ]
    );
  };

  const SettingItem = ({
    title,
    description,
    value,
    onToggle,
    icon,
  }: {
    title: string;
    description: string;
    value: boolean;
    onToggle: (value: boolean) => void;
    icon: string;
  }) => (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FFFFFF',
      borderRadius: 16,
      padding: 20,
      marginBottom: 12,
      shadowColor: '#667eea',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 6,
      borderWidth: 1,
      borderColor: 'rgba(102, 126, 234, 0.1)',
    }}>
      <View style={{
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
      }}>
        <Ionicons name={icon as any} size={24} color="#667eea" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{
          fontSize: 16,
          fontWeight: '600',
          color: '#374151',
          marginBottom: 4,
        }}>
          {title}
        </Text>
        <Text style={{
          fontSize: 14,
          color: '#6B7280',
          lineHeight: 20,
        }}>
          {description}
        </Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: "#E5E7EB", true: "#667eea" }}
        thumbColor={value ? "#FFFFFF" : "#FFFFFF"}
        ios_backgroundColor="#E5E7EB"
        style={{
          transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }],
        }}
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
            Notifications
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
        {/* Message Notifications */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 20,
        }}>
          <Ionicons name="chatbubbles" size={24} color="#667eea" style={{ marginRight: 12 }} />
          <Text style={{
            fontSize: 20,
            fontWeight: 'bold',
            color: '#374151',
          }}>
            Message Notifications
          </Text>
        </View>

        <SettingItem
          title="Message Notifications"
          description="Get notified when you receive new messages"
          value={settings.messageNotifications}
          onToggle={(value) => updateSetting("messageNotifications", value)}
          icon="chatbubble"
        />

        <SettingItem
          title="Group Notifications"
          description="Get notified for group messages"
          value={settings.groupNotifications}
          onToggle={(value) => updateSetting("groupNotifications", value)}
          icon="people"
        />

        <SettingItem
          title="Call Notifications"
          description="Get notified for incoming calls"
          value={settings.callNotifications}
          onToggle={(value) => updateSetting("callNotifications", value)}
          icon="call"
        />

        <SettingItem
          title="Update Notifications"
          description="Get notified for status updates"
          value={settings.updateNotifications}
          onToggle={(value) => updateSetting("updateNotifications", value)}
          icon="refresh"
        />

        {/* Notification Style */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 20,
          marginTop: 30,
        }}>
          <Ionicons name="settings" size={24} color="#667eea" style={{ marginRight: 12 }} />
          <Text style={{
            fontSize: 20,
            fontWeight: 'bold',
            color: '#374151',
          }}>
            Notification Style
          </Text>
        </View>

        <SettingItem
          title="Sound"
          description="Play sound for notifications"
          value={settings.soundEnabled}
          onToggle={(value) => updateSetting("soundEnabled", value)}
          icon="volume-high"
        />

        <SettingItem
          title="Vibration"
          description="Vibrate for notifications"
          value={settings.vibrationEnabled}
          onToggle={(value) => updateSetting("vibrationEnabled", value)}
          icon="phone-portrait"
        />

        <SettingItem
          title="Show Preview"
          description="Show message content in notifications"
          value={settings.showPreview}
          onToggle={(value) => updateSetting("showPreview", value)}
          icon="eye"
        />

        {/* Quiet Hours */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 20,
          marginTop: 30,
        }}>
          <Ionicons name="moon" size={24} color="#667eea" style={{ marginRight: 12 }} />
          <Text style={{
            fontSize: 20,
            fontWeight: 'bold',
            color: '#374151',
          }}>
            Quiet Hours
          </Text>
        </View>

        <SettingItem
          title="Enable Quiet Hours"
          description="Mute notifications during specified hours"
          value={settings.quietHours}
          onToggle={(value) => updateSetting("quietHours", value)}
          icon="moon"
        />

        {settings.quietHours && (
          <View style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 16,
            padding: 20,
            marginBottom: 12,
            shadowColor: '#667eea',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 6,
            borderWidth: 1,
            borderColor: 'rgba(102, 126, 234, 0.1)',
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Ionicons name="time" size={20} color="#667eea" style={{ marginRight: 8 }} />
              <Text style={{
                fontSize: 16,
                color: '#374151',
                fontWeight: '500',
              }}>
                Quiet hours: {settings.quietStart} - {settings.quietEnd}
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleQuietHoursChange}
              style={{
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: 'rgba(102, 126, 234, 0.2)',
              }}
            >
              <Text style={{
                color: '#667eea',
                textAlign: 'center',
                fontWeight: '600',
                fontSize: 16,
              }}>
                Change Times
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Reset Button */}
        <TouchableOpacity
          onPress={() => {
            Alert.alert(
              "Reset Settings",
              "Are you sure you want to reset all notification settings to default?",
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
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderWidth: 2,
            borderColor: 'rgba(239, 68, 68, 0.2)',
            paddingVertical: 16,
            paddingHorizontal: 20,
            borderRadius: 16,
            marginTop: 30,
            shadowColor: '#EF4444',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="refresh" size={20} color="#EF4444" style={{ marginRight: 8 }} />
            <Text style={{
              color: '#EF4444',
              textAlign: 'center',
              fontWeight: '600',
              fontSize: 16,
            }}>
              Reset to Default
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
