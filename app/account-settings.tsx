import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { RootState } from "../src/redux/store";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
    Alert.alert(
      "Change Phone Number",
      "This will require verification of your new phone number.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Continue",
          onPress: () =>
            Alert.alert(
              "Coming Soon",
              "Phone number change will be available soon",
            ),
        },
      ],
    );
  };

  const handleChangeEmail = () => {
    Alert.alert("Change Email", "Enter your new email address:", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Update",
        onPress: () =>
          Alert.alert("Coming Soon", "Email change will be available soon"),
      },
    ]);
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
                  onPress: () =>
                    Alert.alert(
                      "Coming Soon",
                      "Account deletion will be available soon",
                    ),
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
          onPress: () =>
            Alert.alert("Coming Soon", "Data export will be available soon"),
        },
      ],
    );
  };

  const SettingItem = ({
    title,
    description,
    value,
    onPress,
    icon,
    iconColor = "#3B82F6",
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
      className="flex-row items-center py-4 px-4 bg-white rounded-lg mb-3"
    >
      <View
        className="w-10 h-10 rounded-full items-center justify-center mr-4"
        style={{ backgroundColor: `${iconColor}20` }}
      >
        <Ionicons name={icon as any} size={20} color={iconColor} />
      </View>
      <View className="flex-1">
        <Text className="text-gray-800 text-base font-medium">{title}</Text>
        <Text className="text-gray-500 text-sm mt-1">{description}</Text>
        {value && <Text className="text-gray-600 text-sm mt-1">{value}</Text>}
      </View>
      {showArrow && (
        <Ionicons name="chevron-forward" size={16} color="#6B7280" />
      )}
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 py-4 border-b border-gray-200">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-800">
            Account Settings
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 py-6">
        {/* Account Information */}
        <Text className="text-lg font-semibold text-gray-800 mb-4">
          Account Information
        </Text>

        <SettingItem
          title="Phone Number"
          description="Your registered phone number"
          value={currentUser?.phoneNumber || "Not set"}
          onPress={handleChangePhoneNumber}
          icon="call"
        />

        <SettingItem
          title="Email Address"
          description="Your email address for account recovery"
          value={currentUser?.email || "Not set"}
          onPress={handleChangeEmail}
          icon="mail"
        />

        <SettingItem
          title="Username"
          description="Your unique IraChat username"
          value={currentUser?.username || "Not set"}
          onPress={() => router.push("/edit-profile")}
          icon="at"
        />

        {/* Security */}
        <Text className="text-lg font-semibold text-gray-800 mb-4 mt-6">
          Security
        </Text>

        <SettingItem
          title="Change Password"
          description="Update your account password"
          onPress={() =>
            Alert.alert("Coming Soon", "Password change will be available soon")
          }
          icon="lock-closed"
          iconColor="#10B981"
        />

        <SettingItem
          title="Login Sessions"
          description="Manage your active login sessions"
          onPress={() =>
            Alert.alert(
              "Coming Soon",
              "Session management will be available soon",
            )
          }
          icon="phone-portrait"
          iconColor="#10B981"
        />

        <SettingItem
          title="Two-Factor Authentication"
          description="Add extra security to your account"
          onPress={() =>
            Alert.alert("Coming Soon", "2FA setup will be available soon")
          }
          icon="shield-checkmark"
          iconColor="#10B981"
        />

        {/* Data & Storage */}
        <Text className="text-lg font-semibold text-gray-800 mb-4 mt-6">
          Data & Storage
        </Text>

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
              "Coming Soon",
              "Account info request will be available soon",
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
              "Coming Soon",
              "Account deactivation will be available soon",
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
