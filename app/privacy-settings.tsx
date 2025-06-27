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

interface PrivacySettings {
  lastSeen: "everyone" | "contacts" | "nobody";
  profilePhoto: "everyone" | "contacts" | "nobody";
  status: "everyone" | "contacts" | "nobody";
  readReceipts: boolean;
  groupsAddMe: "everyone" | "contacts" | "nobody";
  liveLocation: boolean;
  callsFrom: "everyone" | "contacts" | "nobody";
  blockedContacts: string[];
  twoStepVerification: boolean;
  disappearingMessages: boolean;
  screenshotNotification: boolean;
}

const defaultSettings: PrivacySettings = {
  lastSeen: "everyone",
  profilePhoto: "everyone",
  status: "everyone",
  readReceipts: true,
  groupsAddMe: "contacts",
  liveLocation: false,
  callsFrom: "everyone",
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
      const savedSettings = await AsyncStorage.getItem("privacySettings");
      if (savedSettings) {
        setSettings({ ...defaultSettings, ...JSON.parse(savedSettings) });
      }
    } catch (error) {
      console.error("Error loading privacy settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (newSettings: PrivacySettings) => {
    try {
      await AsyncStorage.setItem(
        "privacySettings",
        JSON.stringify(newSettings),
      );
      setSettings(newSettings);
    } catch (error) {
      console.error("Error saving privacy settings:", error);
      Alert.alert("Error", "Failed to save settings. Please try again.");
    }
  };

  const updateSetting = (key: keyof PrivacySettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    saveSettings(newSettings);
  };

  const showPrivacyOptions = (
    title: string,
    _currentValue: string,
    onSelect: (value: string) => void,
  ) => {
    Alert.alert(title, "Who can see this information?", [
      { text: "Everyone", onPress: () => onSelect("everyone") },
      { text: "My Contacts", onPress: () => onSelect("contacts") },
      { text: "Nobody", onPress: () => onSelect("nobody") },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const PrivacyItem = ({
    title,
    description,
    value,
    onPress,
    icon,
  }: {
    title: string;
    description: string;
    value: string;
    onPress: () => void;
    icon: string;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      style={{
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
      }}
      activeOpacity={0.7}
    >
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
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={{
          color: '#667eea',
          fontSize: 14,
          marginRight: 8,
          textTransform: 'capitalize',
          fontWeight: '600',
        }}>
          {value}
        </Text>
        <Ionicons name="chevron-forward" size={18} color="#667eea" />
      </View>
    </TouchableOpacity>
  );

  const SwitchItem = ({
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
            Privacy & Security
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
        {/* Who Can See My Info */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 20,
        }}>
          <Ionicons name="eye" size={24} color="#667eea" style={{ marginRight: 12 }} />
          <Text style={{
            fontSize: 20,
            fontWeight: 'bold',
            color: '#374151',
          }}>
            Who Can See My Info
          </Text>
        </View>

        <PrivacyItem
          title="Last Seen"
          description="Who can see when you were last online"
          value={settings.lastSeen}
          onPress={() =>
            showPrivacyOptions("Last Seen", settings.lastSeen, (value) =>
              updateSetting("lastSeen", value),
            )
          }
          icon="time"
        />

        <PrivacyItem
          title="Profile Photo"
          description="Who can see your profile photo"
          value={settings.profilePhoto}
          onPress={() =>
            showPrivacyOptions(
              "Profile Photo",
              settings.profilePhoto,
              (value) => updateSetting("profilePhoto", value),
            )
          }
          icon="person-circle"
        />

        <PrivacyItem
          title="Status"
          description="Who can see your status updates"
          value={settings.status}
          onPress={() =>
            showPrivacyOptions("Status", settings.status, (value) =>
              updateSetting("status", value),
            )
          }
          icon="chatbubble-ellipses"
        />

        {/* Message Settings */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 20,
          marginTop: 30,
        }}>
          <Ionicons name="chatbubbles" size={24} color="#667eea" style={{ marginRight: 12 }} />
          <Text style={{
            fontSize: 20,
            fontWeight: 'bold',
            color: '#374151',
          }}>
            Message Settings
          </Text>
        </View>

        <SwitchItem
          title="Read Receipts"
          description="Let others know when you've read their messages"
          value={settings.readReceipts}
          onToggle={(value) => updateSetting("readReceipts", value)}
          icon="checkmark-done"
        />

        <SwitchItem
          title="Disappearing Messages"
          description="Messages disappear after being read"
          value={settings.disappearingMessages}
          onToggle={(value) => updateSetting("disappearingMessages", value)}
          icon="timer"
        />

        <SwitchItem
          title="Screenshot Notifications"
          description="Notify when someone screenshots your messages"
          value={settings.screenshotNotification}
          onToggle={(value) => updateSetting("screenshotNotification", value)}
          icon="camera"
        />

        {/* Groups & Calls */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 20,
          marginTop: 30,
        }}>
          <Ionicons name="people" size={24} color="#667eea" style={{ marginRight: 12 }} />
          <Text style={{
            fontSize: 20,
            fontWeight: 'bold',
            color: '#374151',
          }}>
            Groups & Calls
          </Text>
        </View>

        <PrivacyItem
          title="Groups"
          description="Who can add you to groups"
          value={settings.groupsAddMe}
          onPress={() =>
            showPrivacyOptions("Groups", settings.groupsAddMe, (value) =>
              updateSetting("groupsAddMe", value),
            )
          }
          icon="people"
        />

        <PrivacyItem
          title="Calls"
          description="Who can call you"
          value={settings.callsFrom}
          onPress={() =>
            showPrivacyOptions("Calls", settings.callsFrom, (value) =>
              updateSetting("callsFrom", value),
            )
          }
          icon="call"
        />

        {/* Security */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 20,
          marginTop: 30,
        }}>
          <Ionicons name="shield-checkmark" size={24} color="#667eea" style={{ marginRight: 12 }} />
          <Text style={{
            fontSize: 20,
            fontWeight: 'bold',
            color: '#374151',
          }}>
            Security
          </Text>
        </View>

        <SwitchItem
          title="Two-Step Verification"
          description="Add extra security to your account"
          value={settings.twoStepVerification}
          onToggle={(value) => {
            if (value) {
              Alert.alert(
                "Two-Step Verification",
                "This feature will be available soon",
              );
            } else {
              updateSetting("twoStepVerification", value);
            }
          }}
          icon="shield-checkmark"
        />

        {/* Blocked Contacts */}
        <TouchableOpacity
          onPress={() =>
            Alert.alert(
              "Blocked Contacts",
              `You have ${settings.blockedContacts.length} blocked contacts`,
            )
          }
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#FFFFFF',
            borderRadius: 16,
            padding: 20,
            marginBottom: 12,
            marginTop: 20,
            shadowColor: '#EF4444',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 6,
            borderWidth: 1,
            borderColor: 'rgba(239, 68, 68, 0.1)',
          }}
          activeOpacity={0.7}
        >
          <View style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 16,
          }}>
            <Ionicons name="ban" size={24} color="#EF4444" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{
              fontSize: 16,
              fontWeight: '600',
              color: '#374151',
              marginBottom: 4,
            }}>
              Blocked Contacts
            </Text>
            <Text style={{
              fontSize: 14,
              color: '#6B7280',
              lineHeight: 20,
            }}>
              {settings.blockedContacts.length} contacts blocked
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#EF4444" />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
