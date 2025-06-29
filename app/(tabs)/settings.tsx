// ⚙️ REAL SETTINGS TAB - Fully functional app settings
// Real profile editing, privacy settings, notifications, and app preferences

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../src/redux/store";
import { realSettingsService, UserSettings } from "../../src/services/realSettingsService";
import { performCompleteLogout } from "../../src/services/logoutService";

export default function SettingsScreen() {
  const dispatch = useDispatch();
  const router = useRouter();
  const currentUser = useSelector((state: RootState) => state.user.currentUser);

  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  
  // Edit profile form
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editEmail, setEditEmail] = useState("");
  
  // Change password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Load settings on component mount
  useEffect(() => {
    if (currentUser?.id) {
      loadSettings();
    }
  }, [currentUser?.id]);

  // Load user settings
  const loadSettings = useCallback(async () => {
    if (!currentUser?.id) return;
    
    try {
      setIsLoading(true);
      const userSettings = await realSettingsService.getUserSettings(currentUser.id);
      if (userSettings) {
        setSettings(userSettings);
        setEditName(userSettings.displayName);
        setEditBio(userSettings.bio || "");
        setEditEmail(userSettings.email || "");
      }
      console.log('✅ Loaded user settings');
    } catch (error) {
      console.error('❌ Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser?.id]);

  // Update setting
  const updateSetting = async (key: keyof UserSettings, value: any) => {
    if (!currentUser?.id || !settings) return;
    
    try {
      const result = await realSettingsService.updateUserSettings(currentUser.id, {
        [key]: value,
      });
      
      if (result.success) {
        setSettings(prev => prev ? { ...prev, [key]: value } : null);
      } else {
        Alert.alert('Error', result.error || 'Failed to update setting');
      }
    } catch (error) {
      console.error('❌ Error updating setting:', error);
      Alert.alert('Error', 'Failed to update setting');
    }
  };

  // Handle profile picture change
  const handleChangeProfilePicture = async () => {
    if (!currentUser?.id) return;
    
    try {
      const result = await realSettingsService.changeProfilePicture(currentUser.id);
      if (result.success) {
        Alert.alert('Success!', 'Profile picture updated');
        // Refresh settings to get new avatar
        await loadSettings();
      } else {
        Alert.alert('Error', result.error || 'Failed to update profile picture');
      }
    } catch (error) {
      console.error('❌ Error changing profile picture:', error);
      Alert.alert('Error', 'Failed to update profile picture');
    }
  };

  // Handle save profile
  const handleSaveProfile = async () => {
    if (!currentUser?.id) return;
    
    try {
      const result = await realSettingsService.updateUserProfile(currentUser.id, {
        displayName: editName.trim(),
        bio: editBio.trim(),
        email: editEmail.trim(),
      });
      
      if (result.success) {
        Alert.alert('Success!', 'Profile updated successfully');
        setShowEditProfile(false);
        await loadSettings();
      } else {
        Alert.alert('Error', result.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('❌ Error saving profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  // Handle change password
  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    
    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }
    
    try {
      const result = await realSettingsService.changePassword(currentPassword, newPassword);
      if (result.success) {
        Alert.alert('Success!', 'Password changed successfully');
        setShowChangePassword(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        Alert.alert('Error', result.error || 'Failed to change password');
      }
    } catch (error) {
      console.error('❌ Error changing password:', error);
      Alert.alert('Error', 'Failed to change password');
    }
  };

  // Handle logout
  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            const result = await performCompleteLogout(dispatch, router);
            if (result.success) {
              Alert.alert("Logged Out", "You have been successfully logged out.");
            } else {
              Alert.alert("Error", result.error || "Failed to logout");
            }
          } catch (error) {
            console.error("❌ Error during logout:", error);
            Alert.alert("Error", "An error occurred during logout");
          }
        },
      },
    ]);
  };

  // Render setting item
  const renderSettingItem = (
    icon: string,
    title: string,
    subtitle?: string,
    onPress?: () => void,
    rightElement?: React.ReactNode
  ) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingLeft}>
        <Ionicons name={icon as any} size={24} color="#667eea" style={styles.settingIcon} />
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {rightElement || <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />}
    </TouchableOpacity>
  );

  // Render switch setting
  const renderSwitchSetting = (
    icon: string,
    title: string,
    subtitle: string,
    value: boolean,
    onValueChange: (value: boolean) => void
  ) => (
    <View style={styles.settingItem}>
      <View style={styles.settingLeft}>
        <Ionicons name={icon as any} size={24} color="#667eea" style={styles.settingIcon} />
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          <Text style={styles.settingSubtitle}>{subtitle}</Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: "#E5E7EB", true: "#667eea" }}
        thumbColor="#FFFFFF"
      />
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Loading settings...</Text>
      </View>
    );
  }

  if (!settings) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load settings</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadSettings}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.profileSection} onPress={() => setShowEditProfile(true)}>
            <Image
              source={{
                uri: settings.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(settings.displayName)}&background=667eea&color=fff`
              }}
              style={styles.profileAvatar}
            />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{settings.displayName}</Text>
              {settings.bio && <Text style={styles.profileBio}>{settings.bio}</Text>}
              <Text style={styles.profilePhone}>{settings.phoneNumber}</Text>
            </View>
            <Ionicons name="create-outline" size={24} color="#667eea" />
          </TouchableOpacity>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          {renderSettingItem(
            "person-circle-outline",
            "Edit Profile",
            "Change your name, bio, and photo",
            () => setShowEditProfile(true)
          )}
          
          {renderSettingItem(
            "lock-closed-outline",
            "Change Password",
            "Update your account password",
            () => setShowChangePassword(true)
          )}
          
          {renderSettingItem(
            "shield-checkmark-outline",
            "Privacy & Security",
            "Control who can see your info",
            () => router.push('/privacy-settings')
          )}
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          
          {renderSwitchSetting(
            "notifications-outline",
            "Message Notifications",
            "Get notified about new messages",
            settings.messageNotifications,
            (value) => updateSetting('messageNotifications', value)
          )}
          
          {renderSwitchSetting(
            "call-outline",
            "Call Notifications",
            "Get notified about incoming calls",
            settings.callNotifications,
            (value) => updateSetting('callNotifications', value)
          )}
          
          {renderSwitchSetting(
            "people-outline",
            "Group Notifications",
            "Get notified about group messages",
            settings.groupNotifications,
            (value) => updateSetting('groupNotifications', value)
          )}
          
          {renderSwitchSetting(
            "volume-high-outline",
            "Sound",
            "Play notification sounds",
            settings.soundEnabled,
            (value) => updateSetting('soundEnabled', value)
          )}
          
          {renderSwitchSetting(
            "phone-portrait-outline",
            "Vibration",
            "Vibrate for notifications",
            settings.vibrationEnabled,
            (value) => updateSetting('vibrationEnabled', value)
          )}
        </View>

        {/* Chat Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chat Settings</Text>
          
          {renderSwitchSetting(
            "checkmark-done-outline",
            "Read Receipts",
            "Let others know when you've read their messages",
            settings.readReceiptsEnabled,
            (value) => updateSetting('readReceiptsEnabled', value)
          )}
          
          {renderSettingItem(
            "text-outline",
            "Font Size",
            `Currently: ${settings.fontSize}`,
            () => {
              // Show font size picker
              Alert.alert(
                'Font Size',
                'Choose your preferred font size',
                [
                  { text: 'Small', onPress: () => updateSetting('fontSize', 'small') },
                  { text: 'Medium', onPress: () => updateSetting('fontSize', 'medium') },
                  { text: 'Large', onPress: () => updateSetting('fontSize', 'large') },
                  { text: 'Cancel', style: 'cancel' },
                ]
              );
            }
          )}
          
          {renderSettingItem(
            "color-palette-outline",
            "Theme",
            `Currently: ${settings.theme}`,
            () => {
              // Show theme picker
              Alert.alert(
                'Theme',
                'Choose your preferred theme',
                [
                  { text: 'Light', onPress: () => updateSetting('theme', 'light') },
                  { text: 'Dark', onPress: () => updateSetting('theme', 'dark') },
                  { text: 'Auto', onPress: () => updateSetting('theme', 'auto') },
                  { text: 'Cancel', style: 'cancel' },
                ]
              );
            }
          )}
        </View>

        {/* Storage & Data Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Storage & Data</Text>
          
          {renderSwitchSetting(
            "cloud-upload-outline",
            "Auto Backup",
            "Automatically backup your chats",
            settings.autoBackup,
            (value) => updateSetting('autoBackup', value)
          )}
          
          {renderSettingItem(
            "download-outline",
            "Auto Download Media",
            `Currently: ${settings.autoDownloadMedia}`,
            () => {
              Alert.alert(
                'Auto Download Media',
                'When should media be downloaded automatically?',
                [
                  { text: 'Never', onPress: () => updateSetting('autoDownloadMedia', 'never') },
                  { text: 'Wi-Fi Only', onPress: () => updateSetting('autoDownloadMedia', 'wifi') },
                  { text: 'Always', onPress: () => updateSetting('autoDownloadMedia', 'always') },
                  { text: 'Cancel', style: 'cancel' },
                ]
              );
            }
          )}
          
          {renderSettingItem(
            "archive-outline",
            "Export Chat History",
            "Download your chat history",
            () => router.push('/export-data')
          )}
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          
          {renderSettingItem(
            "help-circle-outline",
            "Help & Support",
            "Get help and contact support",
            () => router.push('/help')
          )}
          
          {renderSettingItem(
            "information-circle-outline",
            "About",
            "App version and information",
            () => router.push('/about')
          )}
        </View>

        {/* Logout Section */}
        <View style={styles.section}>
          {renderSettingItem(
            "log-out-outline",
            "Logout",
            "Sign out of your account",
            handleLogout,
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          )}
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={showEditProfile}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowEditProfile(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowEditProfile(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <TouchableOpacity onPress={handleSaveProfile}>
              <Text style={styles.modalSave}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.profilePictureSection}>
              <Image
                source={{
                  uri: settings.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(settings.displayName)}&background=667eea&color=fff`
                }}
                style={styles.editProfileAvatar}
              />
              <TouchableOpacity
                style={styles.changePhotoButton}
                onPress={handleChangeProfilePicture}
              >
                <Text style={styles.changePhotoText}>Change Photo</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Name</Text>
              <TextInput
                style={styles.textInput}
                value={editName}
                onChangeText={setEditName}
                placeholder="Enter your name"
                maxLength={50}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Bio</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={editBio}
                onChangeText={setEditBio}
                placeholder="Tell us about yourself"
                multiline
                maxLength={150}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.textInput}
                value={editEmail}
                onChangeText={setEditEmail}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        visible={showChangePassword}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowChangePassword(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowChangePassword(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Change Password</Text>
            <TouchableOpacity onPress={handleChangePassword}>
              <Text style={styles.modalSave}>Save</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Current Password</Text>
              <TextInput
                style={styles.textInput}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Enter current password"
                secureTextEntry
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>New Password</Text>
              <TextInput
                style={styles.textInput}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Enter new password"
                secureTextEntry
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Confirm New Password</Text>
              <TextInput
                style={styles.textInput}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm new password"
                secureTextEntry
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#374151',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 18,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  profileBio: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  profilePhone: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    marginRight: 16,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalCancel: {
    fontSize: 16,
    color: '#6B7280',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  modalSave: {
    fontSize: 16,
    color: '#667eea',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  profilePictureSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  editProfileAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  changePhotoButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#667eea',
  },
  changePhotoText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#374151',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
});
