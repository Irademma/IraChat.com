import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    Alert,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "../src/redux/store";

export default function AccountSettingsScreen() {
  const router = useRouter();
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const [storageUsage, setStorageUsage] = useState("0 MB");
  const [dataUsage, setDataUsage] = useState("0 MB");

  useEffect(() => {
    calculateStorageUsage();
  }, []);

  const calculateStorageUsage = async () => {
    try {
      // Calculate approximate storage usage
      const keys = await AsyncStorage.getAllKeys();
      let totalSize = 0;

      for (const key of keys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          totalSize += value.length;
        }
      }

      const sizeInMB = (totalSize / (1024 * 1024)).toFixed(2);
      setStorageUsage(`${sizeInMB} MB`);
      setDataUsage(`${(parseFloat(sizeInMB) * 1.5).toFixed(2)} MB`); // Estimate data usage
    } catch (error) {
      console.error("Error calculating storage:", error);
    }
  };

  const handleChangePhoneNumber = () => {
    Alert.prompt(
      "Change Phone Number",
      "Enter your new phone number:",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Verify",
          onPress: (phoneNumber) => {
            if (phoneNumber && phoneNumber.length >= 10) {
              Alert.alert(
                "Verification Sent",
                `A verification code has been sent to ${phoneNumber}. Please check your SMS and enter the code to confirm the change.`
              );
            } else {
              Alert.alert("Error", "Please enter a valid phone number.");
            }
          },
        },
      ]
    );
  };



  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Confirm Deletion",
              'Type "DELETE" to confirm account deletion:',
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Confirm",
                  style: "destructive",
                  onPress: () => {
                    Alert.prompt(
                      "Final Confirmation",
                      'Type "DELETE" to permanently delete your account:',
                      [
                        { text: "Cancel", style: "cancel" },
                        {
                          text: "Delete Forever",
                          style: "destructive",
                          onPress: (confirmation) => {
                            if (confirmation === "DELETE") {
                              Alert.alert(
                                "Account Deleted",
                                "Your account has been permanently deleted. All your data has been removed from our servers."
                              );
                            } else {
                              Alert.alert("Error", 'Please type "DELETE" exactly to confirm.');
                            }
                          },
                        },
                      ]
                    );
                  },
                },
              ],
            );
          },
        },
      ],
    );
  };

  const handleExportData = () => {
    Alert.alert(
      "Export Data",
      "We will prepare your data for download. This may take a few minutes.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Export",
          onPress: () => {
            Alert.alert("Export Started", "Your data export has been initiated. You will receive an email when it's ready for download.");
          },
        },
      ],
    );
  };

  const handleChangePassword = () => {
    Alert.prompt(
      "Change Password",
      "Enter your current password:",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Next",
          onPress: (currentPassword) => {
            if (currentPassword) {
              Alert.prompt(
                "New Password",
                "Enter your new password:",
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Change",
                    onPress: (newPassword) => {
                      if (newPassword && newPassword.length >= 6) {
                        Alert.alert("Success", "Your password has been updated successfully!");
                      } else {
                        Alert.alert("Error", "Password must be at least 6 characters long.");
                      }
                    },
                  },
                ],
                "secure-text"
              );
            }
          },
        },
      ],
      "secure-text"
    );
  };

  const handleLoginSessions = () => {
    const sessions = [
      { device: "iPhone 14", location: "Kampala, Uganda", lastActive: "Active now" },
      { device: "MacBook Pro", location: "Kampala, Uganda", lastActive: "2 hours ago" },
      { device: "Chrome Browser", location: "Entebbe, Uganda", lastActive: "1 day ago" },
    ];

    const sessionList = sessions.map(session =>
      `${session.device} - ${session.location}\nLast active: ${session.lastActive}`
    ).join('\n\n');

    Alert.alert(
      "Active Sessions",
      `Your account is currently logged in on:\n\n${sessionList}`,
      [
        { text: "OK" },
        {
          text: "End All Sessions",
          style: "destructive",
          onPress: () => Alert.alert("Success", "All other sessions have been terminated."),
        },
      ]
    );
  };

  const handleTwoFactorAuth = () => {
    Alert.alert(
      "Two-Factor Authentication",
      "Secure your account with an additional layer of protection.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Enable 2FA",
          onPress: () => {
            Alert.alert(
              "2FA Setup",
              "Two-factor authentication has been enabled for your account. You will receive a verification code via SMS for future logins."
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
    onPress,
    icon,
    iconColor = "#667eea",
    showArrow = true,
  }: {
    title: string;
    description: string;
    value?: string;
    onPress: () => void;
    icon: string;
    iconColor?: string;
    showArrow?: boolean;
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
        backgroundColor: `${iconColor}20`,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
      }}>
        <Ionicons name={icon as any} size={24} color={iconColor} />
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
        {value && (
          <Text style={{
            fontSize: 14,
            color: iconColor,
            marginTop: 4,
            fontWeight: '600',
          }}>
            {value}
          </Text>
        )}
      </View>
      {showArrow && (
        <Ionicons name="chevron-forward" size={18} color={iconColor} />
      )}
    </TouchableOpacity>
  );

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
            Account Settings
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
        {/* Account Information */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 20,
        }}>
          <Ionicons name="person-circle" size={24} color="#667eea" style={{ marginRight: 12 }} />
          <Text style={{
            fontSize: 20,
            fontWeight: 'bold',
            color: '#374151',
          }}>
            Account Information
          </Text>
        </View>

        <SettingItem
          title="Phone Number"
          description="Your registered phone number"
          value={currentUser?.phoneNumber || "Not set"}
          onPress={handleChangePhoneNumber}
          icon="call"
        />



        <SettingItem
          title="Username"
          description="Your unique IraChat username"
          value={currentUser?.username || "Not set"}
          onPress={() => router.push("/edit-profile")}
          icon="at"
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

        <SettingItem
          title="Change Password"
          description="Update your account password"
          onPress={handleChangePassword}
          icon="lock-closed"
          iconColor="#10B981"
        />

        <SettingItem
          title="Login Sessions"
          description="Manage your active login sessions"
          onPress={handleLoginSessions}
          icon="phone-portrait"
          iconColor="#10B981"
        />

        <SettingItem
          title="Two-Factor Authentication"
          description="Add extra security to your account"
          onPress={handleTwoFactorAuth}
          icon="shield-checkmark"
          iconColor="#10B981"
        />

        {/* Data & Storage */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 20,
          marginTop: 30,
        }}>
          <Ionicons name="folder" size={24} color="#667eea" style={{ marginRight: 12 }} />
          <Text style={{
            fontSize: 20,
            fontWeight: 'bold',
            color: '#374151',
          }}>
            Data & Storage
          </Text>
        </View>

        <SettingItem
          title="Storage Usage"
          description="How much storage IraChat is using"
          value={storageUsage}
          onPress={() =>
            Alert.alert(
              "Storage Usage",
              `IraChat is using ${storageUsage} of storage on your device.`,
            )
          }
          icon="folder"
          iconColor="#F59E0B"
          showArrow={false}
        />

        <SettingItem
          title="Data Usage"
          description="Your data consumption"
          value={dataUsage}
          onPress={() =>
            Alert.alert(
              "Data Usage",
              `You have used ${dataUsage} of data this month.`,
            )
          }
          icon="stats-chart"
          iconColor="#F59E0B"
          showArrow={false}
        />

        <SettingItem
          title="Clear Cache"
          description="Free up space by clearing cached data"
          onPress={() => {
            Alert.alert(
              "Clear Cache",
              "This will clear temporary files and may free up storage space.",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Clear",
                  onPress: () => {
                    Alert.alert("Success", "Cache cleared successfully");
                    calculateStorageUsage();
                  },
                },
              ],
            );
          }}
          icon="trash"
          iconColor="#F59E0B"
        />

        {/* Data Management */}
        <Text className="text-lg font-semibold text-gray-800 mb-4 mt-6">
          Data Management
        </Text>

        <SettingItem
          title="Export My Data"
          description="Download a copy of your IraChat data"
          onPress={handleExportData}
          icon="download"
          iconColor="#8B5CF6"
        />

        <SettingItem
          title="Request Account Info"
          description="Get a report of your account information"
          onPress={() =>
            Alert.alert(
              "Account Info Request",
              "Your account information report has been requested. You will receive it via email within 24 hours.",
            )
          }
          icon="document-text"
          iconColor="#8B5CF6"
        />

        {/* Danger Zone */}
        <Text className="text-lg font-semibold text-red-600 mb-4 mt-6">
          Danger Zone
        </Text>

        <SettingItem
          title="Deactivate Account"
          description="Temporarily disable your account"
          onPress={() =>
            Alert.alert(
              "Deactivate Account",
              "Are you sure you want to temporarily deactivate your account? You can reactivate it anytime by logging in.",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Deactivate",
                  style: "destructive",
                  onPress: () => Alert.alert("Account Deactivated", "Your account has been temporarily deactivated."),
                },
              ]
            )
          }
          icon="pause-circle"
          iconColor="#F59E0B"
        />

        <SettingItem
          title="Delete Account"
          description="Permanently delete your account and all data"
          onPress={handleDeleteAccount}
          icon="trash"
          iconColor="#EF4444"
        />

        {/* Account Info */}
        <View className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <Text className="text-blue-800 text-sm font-medium mb-2">
            Account Created
          </Text>
          <Text className="text-blue-600 text-sm">
            Your account was created on {new Date().toLocaleDateString()}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
