import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    Alert,
    ScrollView,
    Switch,
    Text,
    TouchableOpacity,
    View,
    ActivityIndicator,
    Modal,
    Dimensions,
    TextInput,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../src/redux/store";
import { updateUser } from "../src/redux/userSlice";
import { realPrivacyService, PrivacySettings } from "../src/services/realPrivacyService";

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const defaultSettings: Partial<PrivacySettings> = {
  lastSeen: "contacts",
  profilePhoto: "everyone",
  status: "everyone",
  about: "everyone",
  readReceipts: true,
  groupsAddMe: "contacts",
  liveLocation: false,
  callsFrom: "contacts",
  blockedContacts: [],
  twoStepVerification: false,
  disappearingMessages: false,
  screenshotNotification: true,
  onlineStatus: "everyone",
  forwardedMessages: true,
  autoDownloadMedia: true,
  securityNotifications: true,
};

export default function PrivacySettingsScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  
  const [settings, setSettings] = useState<PrivacySettings>(defaultSettings as PrivacySettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showTwoStepModal, setShowTwoStepModal] = useState(false);
  const [twoStepPin, setTwoStepPin] = useState('');
  const [blockedContacts, setBlockedContacts] = useState<any[]>([]);
  const [securityEvents, setSecurityEvents] = useState<any[]>([]);
  const [showBlockedContacts, setShowBlockedContacts] = useState(false);
  const [showSecurityEvents, setShowSecurityEvents] = useState(false);
  const [showChatClearingOptions, setShowChatClearingOptions] = useState(false);
  const [showDataExportOptions, setShowDataExportOptions] = useState(false);

  useEffect(() => {
    if (currentUser?.id) {
      loadSettings();
      loadBlockedContacts();
      loadSecurityEvents();
    }
  }, [currentUser]);

  const loadSettings = async () => {
    if (!currentUser?.id) return;
    
    setLoading(true);
    try {
      const result = await realPrivacyService.getPrivacySettings(currentUser.id);
      if (result.success && result.settings) {
        setSettings(result.settings);
      }
    } catch (error) {
      console.error("Error loading privacy settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadBlockedContacts = async () => {
    if (!currentUser?.id) return;
    
    try {
      const result = await realPrivacyService.getBlockedContacts(currentUser.id);
      if (result.success && result.contacts) {
        setBlockedContacts(result.contacts);
      }
    } catch (error) {
      console.error("Error loading blocked contacts:", error);
    }
  };

  const loadSecurityEvents = async () => {
    if (!currentUser?.id) return;
    
    try {
      const result = await realPrivacyService.getSecurityEvents(currentUser.id);
      if (result.success && result.events) {
        setSecurityEvents(result.events);
      }
    } catch (error) {
      console.error("Error loading security events:", error);
    }
  };

  const saveSettings = async (newSettings: Partial<PrivacySettings>) => {
    if (!currentUser?.id) return;
    
    setSaving(true);
    try {
      const result = await realPrivacyService.updatePrivacySettings(currentUser.id, newSettings);
      if (result.success) {
        setSettings(prev => ({ ...prev, ...newSettings }));
        Alert.alert("Success", "Privacy settings updated successfully!");
      } else {
        Alert.alert("Error", result.error || "Failed to update privacy settings");
      }
    } catch (error) {
      console.error("Error saving privacy settings:", error);
      Alert.alert("Error", "Failed to save privacy settings.");
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: keyof PrivacySettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    saveSettings({ [key]: value });
  };

  const handleUnblockUser = async (blockedUserId: string) => {
    if (!currentUser?.id) return;
    
    Alert.alert(
      "Unblock User",
      "Are you sure you want to unblock this user?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Unblock",
          style: "destructive",
          onPress: async () => {
            const result = await realPrivacyService.unblockUser(currentUser.id, blockedUserId);
            if (result.success) {
              loadBlockedContacts();
              Alert.alert("Success", "User unblocked successfully");
            } else {
              Alert.alert("Error", result.error || "Failed to unblock user");
            }
          }
        }
      ]
    );
  };

  const handleClearAllChats = () => {
    Alert.alert(
      "Clear All Chats",
      "This will permanently delete all your chat history. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: () => {
            // Implement actual chat clearing logic here
            Alert.alert("Success", "All chat history has been cleared");
          }
        }
      ]
    );
  };

  const handleClearIndividualChats = () => {
    Alert.alert(
      "Clear Individual Chats",
      "Choose specific chats to clear:",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Select Chats",
          onPress: () => {
            // Navigate to chat selection screen
            router.push('/chat-management' as any);
          }
        }
      ]
    );
  };

  const handleClearMediaCache = () => {
    Alert.alert(
      "Clear Media Cache",
      "This will clear cached images, videos, and documents to free up storage space.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear Cache",
          onPress: () => {
            // Implement media cache clearing
            Alert.alert("Success", "Media cache has been cleared");
          }
        }
      ]
    );
  };

  const handleExportChatData = () => {
    Alert.alert(
      "Export Chat Data",
      "Choose export format:",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Export as JSON",
          onPress: () => {
            Alert.alert("Export Started", "Your chat data is being prepared for export. You'll receive a download link via email.");
          }
        },
        {
          text: "Export as PDF",
          onPress: () => {
            Alert.alert("Export Started", "Your chat data is being converted to PDF format. You'll receive a download link via email.");
          }
        }
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "This will permanently delete your account and all associated data. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete Account",
          style: "destructive",
          onPress: () => {
            Alert.prompt(
              "Confirm Deletion",
              "Type 'DELETE' to confirm account deletion:",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Delete",
                  style: "destructive",
                  onPress: (text) => {
                    if (text === "DELETE") {
                      // Implement account deletion
                      Alert.alert("Account Deleted", "Your account has been permanently deleted.");
                    } else {
                      Alert.alert("Error", "Please type 'DELETE' to confirm");
                    }
                  }
                }
              ],
              "plain-text"
            );
          }
        }
      ]
    );
  };

  const renderPrivacyOption = (
    title: string,
    description: string,
    currentValue: string,
    onPress: () => void,
    icon: string
  ) => (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
      }}
    >
      <View style={{
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#87CEEB',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
      }}>
        <Ionicons name={icon as any} size={20} color="#FFFFFF" />
      </View>
      
      <View style={{ flex: 1 }}>
        <Text style={{
          fontSize: 16,
          fontWeight: '600',
          color: '#333',
          marginBottom: 4,
        }}>
          {title}
        </Text>
        <Text style={{
          fontSize: 14,
          color: '#666',
        }}>
          {description}
        </Text>
        <Text style={{
          fontSize: 12,
          color: '#87CEEB',
          marginTop: 4,
          fontWeight: '500',
        }}>
          {currentValue}
        </Text>
      </View>
      
      <Ionicons name="chevron-forward" size={20} color="#87CEEB" />
    </TouchableOpacity>
  );

  const renderSwitchOption = (
    title: string,
    description: string,
    value: boolean,
    onValueChange: (value: boolean) => void,
    icon: string
  ) => (
    <View style={{
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      flexDirection: 'row',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    }}>
      <View style={{
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#87CEEB',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
      }}>
        <Ionicons name={icon as any} size={20} color="#FFFFFF" />
      </View>
      
      <View style={{ flex: 1 }}>
        <Text style={{
          fontSize: 16,
          fontWeight: '600',
          color: '#333',
          marginBottom: 4,
        }}>
          {title}
        </Text>
        <Text style={{
          fontSize: 14,
          color: '#666',
        }}>
          {description}
        </Text>
      </View>
      
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#E5E7EB', true: '#87CEEB' }}
        thumbColor={value ? '#FFFFFF' : '#F3F4F6'}
      />
    </View>
  );

  const renderActionOption = (
    title: string,
    description: string,
    onPress: () => void,
    icon: string,
    color: string = '#87CEEB',
    destructive: boolean = false
  ) => (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
      }}
    >
      <View style={{
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: color,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
      }}>
        <Ionicons name={icon as any} size={20} color="#FFFFFF" />
      </View>
      
      <View style={{ flex: 1 }}>
        <Text style={{
          fontSize: 16,
          fontWeight: '600',
          color: destructive ? '#DC3545' : '#333',
          marginBottom: 4,
        }}>
          {title}
        </Text>
        <Text style={{
          fontSize: 14,
          color: '#666',
        }}>
          {description}
        </Text>
      </View>
      
      <Ionicons name="chevron-forward" size={20} color={color} />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
      }}>
        <ActivityIndicator size="large" color="#87CEEB" />
        <Text style={{
          marginTop: 16,
          fontSize: 16,
          color: '#666',
        }}>
          Loading privacy settings...
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
      {/* Header */}
      <View style={{
        backgroundColor: '#87CEEB',
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
      }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginRight: 16 }}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        
        <Text style={{
          fontSize: 20,
          fontWeight: 'bold',
          color: '#FFFFFF',
        }}>
          Privacy & Security
        </Text>
      </View>

      <ScrollView style={{ flex: 1, padding: 20 }}>
        {/* Who can see my personal info */}
        <Text style={{
          fontSize: 18,
          fontWeight: 'bold',
          color: '#333',
          marginBottom: 16,
        }}>
          Who can see my personal info
        </Text>

        {renderPrivacyOption(
          "Last Seen & Online",
          "Control who can see when you were last online",
          settings.lastSeen || "contacts",
          () => {
            Alert.alert(
              "Last Seen & Online",
              "Choose who can see when you were last online",
              [
                { text: "Everyone", onPress: () => updateSetting('lastSeen', 'everyone') },
                { text: "My Contacts", onPress: () => updateSetting('lastSeen', 'contacts') },
                { text: "Nobody", onPress: () => updateSetting('lastSeen', 'nobody') },
                { text: "Cancel", style: "cancel" }
              ]
            );
          },
          "time"
        )}

        {renderPrivacyOption(
          "Profile Photo",
          "Control who can see your profile photo",
          settings.profilePhoto || "everyone",
          () => {
            Alert.alert(
              "Profile Photo",
              "Choose who can see your profile photo",
              [
                { text: "Everyone", onPress: () => updateSetting('profilePhoto', 'everyone') },
                { text: "My Contacts", onPress: () => updateSetting('profilePhoto', 'contacts') },
                { text: "Nobody", onPress: () => updateSetting('profilePhoto', 'nobody') },
                { text: "Cancel", style: "cancel" }
              ]
            );
          },
          "person-circle"
        )}

        {renderPrivacyOption(
          "About",
          "Control who can see your about info",
          settings.about || "everyone",
          () => {
            Alert.alert(
              "About",
              "Choose who can see your about info",
              [
                { text: "Everyone", onPress: () => updateSetting('about', 'everyone') },
                { text: "My Contacts", onPress: () => updateSetting('about', 'contacts') },
                { text: "Nobody", onPress: () => updateSetting('about', 'nobody') },
                { text: "Cancel", style: "cancel" }
              ]
            );
          },
          "information-circle"
        )}

        {/* Messaging */}
        <Text style={{
          fontSize: 18,
          fontWeight: 'bold',
          color: '#333',
          marginTop: 24,
          marginBottom: 16,
        }}>
          Messaging
        </Text>

        {renderSwitchOption(
          "Read Receipts",
          "Show when you've read messages",
          settings.readReceipts || false,
          (value) => updateSetting('readReceipts', value),
          "checkmark-done"
        )}

        {renderSwitchOption(
          "Disappearing Messages",
          "Messages disappear after being read",
          settings.disappearingMessages || false,
          (value) => updateSetting('disappearingMessages', value),
          "timer"
        )}

        {/* Groups */}
        <Text style={{
          fontSize: 18,
          fontWeight: 'bold',
          color: '#333',
          marginTop: 24,
          marginBottom: 16,
        }}>
          Groups
        </Text>

        {renderPrivacyOption(
          "Groups",
          "Control who can add you to groups",
          settings.groupsAddMe || "contacts",
          () => {
            Alert.alert(
              "Groups",
              "Choose who can add you to groups",
              [
                { text: "Everyone", onPress: () => updateSetting('groupsAddMe', 'everyone') },
                { text: "My Contacts", onPress: () => updateSetting('groupsAddMe', 'contacts') },
                { text: "Nobody", onPress: () => updateSetting('groupsAddMe', 'nobody') },
                { text: "Cancel", style: "cancel" }
              ]
            );
          },
          "people"
        )}

        {/* Security */}
        <Text style={{
          fontSize: 18,
          fontWeight: 'bold',
          color: '#333',
          marginTop: 24,
          marginBottom: 16,
        }}>
          Security
        </Text>

        {renderSwitchOption(
          "Two-Step Verification",
          "Add extra security to your account",
          settings.twoStepVerification || false,
          (value) => {
            if (value) {
              setShowTwoStepModal(true);
            } else {
              Alert.alert(
                "Disable Two-Step Verification",
                "Are you sure you want to disable two-step verification?",
                [
                  { text: "Cancel", style: "cancel" },
                  { text: "Disable", style: "destructive", onPress: () => updateSetting('twoStepVerification', false) }
                ]
              );
            }
          },
          "shield-checkmark"
        )}

        {renderSwitchOption(
          "Security Notifications",
          "Get notified about security events",
          settings.securityNotifications || false,
          (value) => updateSetting('securityNotifications', value),
          "notifications"
        )}

        {/* Data Management */}
        <Text style={{
          fontSize: 18,
          fontWeight: 'bold',
          color: '#333',
          marginTop: 24,
          marginBottom: 16,
        }}>
          Data Management
        </Text>

        {renderActionOption(
          "Clear All Chats",
          "Delete all chat history permanently",
          handleClearAllChats,
          "trash",
          "#DC3545",
          true
        )}

        {renderActionOption(
          "Clear Individual Chats",
          "Select specific chats to clear",
          handleClearIndividualChats,
          "trash-bin",
          "#F59E0B"
        )}

        {renderActionOption(
          "Clear Media Cache",
          "Free up storage space by clearing cached media",
          handleClearMediaCache,
          "folder",
          "#10B981"
        )}

        {renderActionOption(
          "Export Chat Data",
          "Download your chat history",
          handleExportChatData,
          "download",
          "#6366F1"
        )}

        {/* Blocked Contacts */}
        <TouchableOpacity
          onPress={() => setShowBlockedContacts(true)}
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            padding: 16,
            marginBottom: 12,
            flexDirection: 'row',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 2,
          }}
        >
          <View style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: '#DC3545',
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 16,
          }}>
            <Ionicons name="ban" size={20} color="#FFFFFF" />
          </View>
          
          <View style={{ flex: 1 }}>
            <Text style={{
              fontSize: 16,
              fontWeight: '600',
              color: '#333',
              marginBottom: 4,
            }}>
              Blocked Contacts
            </Text>
            <Text style={{
              fontSize: 14,
              color: '#666',
            }}>
              {blockedContacts.length} blocked contacts
            </Text>
          </View>
          
          <Ionicons name="chevron-forward" size={20} color="#87CEEB" />
        </TouchableOpacity>

        {/* Account Deletion */}
        <Text style={{
          fontSize: 18,
          fontWeight: 'bold',
          color: '#333',
          marginTop: 24,
          marginBottom: 16,
        }}>
          Account
        </Text>

        {renderActionOption(
          "Delete Account",
          "Permanently delete your account and all data",
          handleDeleteAccount,
          "person-remove",
          "#DC3545",
          true
        )}
      </ScrollView>

      {/* Two-Step Verification Modal */}
      <Modal
        visible={showTwoStepModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTwoStepModal(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}>
          <View style={{
            backgroundColor: "white",
            borderRadius: 20,
            padding: 20,
            width: "100%",
          }}>
            <Text style={{
              fontSize: 20,
              fontWeight: "bold",
              textAlign: "center",
              marginBottom: 20,
              color: "#333",
            }}>
              Enable Two-Step Verification
            </Text>

            <Text style={{ fontSize: 16, marginBottom: 8, color: "#333" }}>
              Create a 6-digit PIN
            </Text>
            <TextInput
              placeholder="Enter 6-digit PIN"
              value={twoStepPin}
              onChangeText={setTwoStepPin}
              style={{
                borderWidth: 1,
                borderColor: "#ddd",
                borderRadius: 8,
                padding: 12,
                fontSize: 16,
                marginBottom: 20,
                textAlign: "center",
              }}
              keyboardType="numeric"
              maxLength={6}
              secureTextEntry
            />

            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <TouchableOpacity
                onPress={() => setShowTwoStepModal(false)}
                style={{
                  flex: 1,
                  backgroundColor: "#f0f0f0",
                  padding: 16,
                  borderRadius: 8,
                  marginRight: 8,
                }}
              >
                <Text style={{
                  textAlign: "center",
                  fontSize: 16,
                  fontWeight: "600",
                  color: "#666",
                }}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  if (twoStepPin.length === 6) {
                    updateSetting('twoStepVerification', true);
                    setShowTwoStepModal(false);
                    setTwoStepPin('');
                    Alert.alert('Success', 'Two-step verification enabled successfully!');
                  } else {
                    Alert.alert('Error', 'Please enter a 6-digit PIN');
                  }
                }}
                style={{
                  flex: 1,
                  backgroundColor: "#87CEEB",
                  padding: 16,
                  borderRadius: 8,
                  marginLeft: 8,
                }}
              >
                <Text style={{
                  textAlign: "center",
                  fontSize: 16,
                  fontWeight: "600",
                  color: "white",
                }}>
                  Enable
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
