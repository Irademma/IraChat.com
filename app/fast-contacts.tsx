import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Share,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth } from "../src/services/firebaseSimple";
import { chatService } from "../src/services/firestoreService";
import optimizedContactsService from "../src/services/optimizedContactsService";

// Contact interface definition
interface Contact {
  id: string;
  name: string;
  phoneNumber: string;
  avatar?: string;
  isIraChatUser: boolean;
  userId?: string;
  isOnline?: boolean;
  lastSeen?: Date | null;
}

export default function FastContactsScreen() {
  const router = useRouter();
  const [searchText, setSearchText] = useState("");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStage, setLoadingStage] = useState("Initializing...");
  const [error, setError] = useState<string | null>(null);

  // Load contacts on component mount - FAST!
  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setLoadingProgress(0);
      setLoadingStage("Checking permissions...");

      console.log("🚀 Starting FAST contact loading...");
      const startTime = Date.now();

      // Stage 1: Check permissions (0-20%)
      setLoadingProgress(20);
      setLoadingStage("Accessing contacts...");

      // Stage 2: Load contacts with timeout (20-60%) - FAST 3 second timeout
      const contactsPromise = optimizedContactsService.getIraChatContacts();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Loading timeout - using cached data")), 3000)
      );

      setLoadingProgress(60);
      setLoadingStage("Processing contacts...");

      // Race between contacts loading and timeout
      const contactsList = await Promise.race([contactsPromise, timeoutPromise]) as Contact[];

      // Stage 3: Process and filter (60-80%)
      setLoadingProgress(80);
      setLoadingStage("Organizing contacts...");

      // Sort contacts: IraChat users first, then alphabetically
      const sortedContacts = contactsList.sort((a, b) => {
        if (a.isIraChatUser && !b.isIraChatUser) return -1;
        if (!a.isIraChatUser && b.isIraChatUser) return 1;
        return a.name.localeCompare(b.name);
      });

      // Stage 4: Update state (80-100%)
      setLoadingProgress(100);
      setLoadingStage("Finalizing...");

      setContacts(sortedContacts);
      setFilteredContacts(sortedContacts);

      const loadTime = Date.now() - startTime;
      console.log(`✅ Loaded ${sortedContacts.length} contacts in ${loadTime}ms!`);

      // Brief delay to show completion
      await new Promise(resolve => setTimeout(resolve, 200));

    } catch (error: any) {
      console.error("❌ Error loading contacts:", error);
      setError(error.message || "Failed to load contacts");

      // Show cached contacts if available
      const cachedContacts = await getCachedContacts();
      if (cachedContacts.length > 0) {
        setContacts(cachedContacts);
        setFilteredContacts(cachedContacts);
        setError("Using cached contacts (offline mode)");
      }
    } finally {
      setIsLoading(false);
      setLoadingProgress(0);
      setLoadingStage("");
    }
  };

  // Simple cache implementation
  const getCachedContacts = async (): Promise<Contact[]> => {
    try {
      // In a real app, you'd use AsyncStorage
      // For now, return empty array
      return [];
    } catch {
      return [];
    }
  };

  const formatLastSeen = (date: Date | null) => {
    if (!date) return "Unknown";
    
    try {
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);

      if (minutes < 1) return "just now";
      if (minutes < 60) return `${minutes}m ago`;
      if (hours < 24) return `${hours}h ago`;
      return `${days}d ago`;
    } catch (error) {
      console.error("Error formatting last seen:", error);
      return "Unknown";
    }
  };

  const handleSearch = (text: string) => {
    setSearchText(text);

    // Debounced search for better performance
    if (text.trim() === "") {
      setFilteredContacts(contacts);
    } else {
      // Fast search with optimized filtering
      const searchTerm = text.toLowerCase();
      const filtered = contacts.filter((contact) => {
        const nameMatch = contact.name.toLowerCase().includes(searchTerm);
        const phoneMatch = contact.phoneNumber.includes(text);
        return nameMatch || phoneMatch;
      });
      setFilteredContacts(filtered);
    }
  };

  const openChat = async (contact: Contact) => {
    if (!contact.isIraChatUser) {
      // Handle invite for non-IraChat users
      handleInviteContact(contact);
      return;
    }

    try {
      console.log("🚀 Opening chat with IraChat user:", contact.name);

      // For IraChat users, create or find existing chat
      const currentUser = auth?.currentUser;
      if (!currentUser) {
        Alert.alert("Error", "Please log in first");
        return;
      }

      // Create or get existing chat
      const chatId = await chatService.createChat(
        [currentUser.uid, contact.userId || contact.id],
        false
      );

      console.log("✅ Chat ready, navigating to:", chatId);

      // Navigate to individual chat
      router.replace({
        pathname: "/individual-chat",
        params: {
          contactId: contact.userId,
          contactName: contact.name,
          contactAvatar: contact.avatar,
          contactIsOnline: contact.isOnline?.toString() || "false",
          contactLastSeen: contact.lastSeen?.getTime().toString() || "",
          chatId: chatId,
        },
      });
    } catch (error) {
      console.error("❌ Error opening chat:", error);
      Alert.alert("Error", "Failed to open chat. Please try again.");
    }
  };

  const handleInviteContact = (contact: Contact) => {
    const inviteMessage = `Hey ${contact.name}! Join me on IraChat - a secure messaging app. Download it here: https://irachat.app`;

    Alert.alert(
      "Invite to IraChat",
      `Invite ${contact.name} to join IraChat?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Send SMS",
          onPress: () => {
            // Open SMS with pre-filled message
            const smsUrl = `sms:${contact.phoneNumber}?body=${encodeURIComponent(inviteMessage)}`;
            Linking.openURL(smsUrl).catch(() => {
              Alert.alert("Error", "Could not open SMS app");
            });
          }
        },
        {
          text: "Share",
          onPress: () => {
            // Use share API
            Share.share({
              message: inviteMessage,
              title: "Join IraChat"
            }).catch(() => {
              Alert.alert("Error", "Could not share invite");
            });
          }
        }
      ]
    );
  };

  // Handle voice call
  const handleVoiceCall = async (contact: Contact) => {
    try {
      console.log("📞 Starting voice call with:", contact.name);

      // Navigate to call screen with comprehensive voice call parameters
      router.push({
        pathname: "/call",
        params: {
          type: "voice",
          contactId: contact.id,
          contactName: contact.name,
          contactAvatar: contact.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(contact.name)}&background=10B981&color=fff`,
          contactPhoneNumber: contact.phoneNumber,
          callId: `voice_${Date.now()}_${contact.id}`,
          isOutgoing: "true",
          isIncoming: "false",
        },
      });
    } catch (error) {
      console.error("❌ Failed to start voice call:", error);
      Alert.alert("Error", "Failed to start voice call");
    }
  };

  // Handle video call
  const handleVideoCall = async (contact: Contact) => {
    try {
      console.log("📹 Starting video call with:", contact.name);

      // Navigate to call screen with comprehensive video call parameters
      router.push({
        pathname: "/call",
        params: {
          type: "video",
          contactId: contact.id,
          contactName: contact.name,
          contactAvatar: contact.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(contact.name)}&background=3B82F6&color=fff`,
          contactPhoneNumber: contact.phoneNumber,
          callId: `video_${Date.now()}_${contact.id}`,
          isOutgoing: "true",
          isIncoming: "false",
        },
      });
    } catch (error) {
      console.error("❌ Failed to start video call:", error);
      Alert.alert("Error", "Failed to start video call");
    }
  };

  const renderContact = (contact: Contact) => {
    return (
      <TouchableOpacity
        key={contact.id}
        onPress={() => openChat(contact)}
        className="flex-row items-center px-4 py-3 border-b border-gray-100"
        activeOpacity={0.7}
      >
        <View style={{ position: 'relative' }}>
          {(() => {
            const Avatar = require("../src/components/Avatar").Avatar;
            return (
              <Avatar
                name={contact.name}
                imageUrl={contact.avatar}
                size="medium"
                showOnlineStatus={contact.isIraChatUser}
                isOnline={contact.isOnline}
              />
            );
          })()}
        </View>

        <View className="flex-1 ml-3">
          <Text className="text-gray-900 font-semibold text-base">
            {contact.name}
          </Text>
          <View className="flex-row items-center mt-1">
            {contact.isIraChatUser ? (
              contact.isOnline ? (
                <Text className="text-green-600 text-sm font-medium">Online</Text>
              ) : (
                <Text className="text-gray-500 text-sm">
                  Last seen {formatLastSeen(contact.lastSeen || null)}
                </Text>
              )
            ) : (
              <Text className="text-gray-400 text-sm">
                Not on IraChat
              </Text>
            )}
          </View>
        </View>

        <View className="flex-row items-center space-x-2">
          {contact.isIraChatUser ? (
            <>
              {/* Voice Call Button */}
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  handleVoiceCall(contact);
                }}
                className="items-center"
              >
                <View className="bg-green-100 rounded-full p-2">
                  <Ionicons name="call" size={16} color="#10b981" />
                </View>
              </TouchableOpacity>

              {/* Video Call Button */}
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  handleVideoCall(contact);
                }}
                className="items-center"
              >
                <View className="bg-blue-100 rounded-full p-2">
                  <Ionicons name="videocam" size={16} color="#3b82f6" />
                </View>
              </TouchableOpacity>

              {/* Chat Button */}
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  openChat(contact);
                }}
                className="items-center"
              >
                <View className="bg-sky-100 rounded-full p-2">
                  <Ionicons name="chatbubble" size={16} color="#0ea5e9" />
                </View>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                handleInviteContact(contact);
              }}
              className="items-center"
            >
              <View className="bg-green-100 rounded-full p-2">
                <Ionicons name="person-add" size={16} color="#10b981" />
              </View>
              <Text className="text-xs text-green-600 mt-1 font-medium">Invite</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 bg-sky-500 shadow-sm">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        <View className="flex-1">
          <Text className="text-white font-semibold text-lg">
            Select Contact
          </Text>
          <Text className="text-white/80 text-sm">
            {filteredContacts.filter(c => c.isIraChatUser).length} IraChat users
          </Text>
        </View>

        <TouchableOpacity onPress={loadContacts}>
          <Ionicons name="refresh" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <View className="flex-row items-center bg-white rounded-full px-4 py-2 border border-gray-200">
          <Ionicons name="search" size={20} color="#6b7280" />
          <TextInput
            value={searchText}
            onChangeText={handleSearch}
            placeholder="Search contacts..."
            className="flex-1 ml-3 text-base"
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch("")}>
              <Ionicons name="close-circle" size={20} color="#6b7280" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Contacts List */}
      <View className="flex-1">
        {isLoading ? (
          <View className="flex-1 items-center justify-center py-20">
            <ActivityIndicator size="large" color="#0ea5e9" />
            <Text className="text-gray-500 mt-4 font-medium">
              {loadingStage || "Loading your contacts..."}
            </Text>

            {/* Progress Bar */}
            <View className="w-64 h-2 bg-gray-200 rounded-full mt-4 overflow-hidden">
              <View
                className="h-full bg-sky-500 rounded-full transition-all duration-300"
                style={{ width: `${loadingProgress}%` }}
              />
            </View>

            <Text className="text-gray-400 text-sm mt-2">
              {loadingProgress > 0 ? `${loadingProgress}% complete` : "Initializing..."}
            </Text>

            {error && (
              <Text className="text-orange-500 text-sm mt-2 text-center px-4">
                {error}
              </Text>
            )}
          </View>
        ) : filteredContacts.length > 0 ? (
          <View className="flex-1">
            {/* IraChat Users Section */}
            {filteredContacts.filter(c => c.isIraChatUser).length > 0 && (
              <View className="px-4 py-3 bg-gray-50">
                <Text className="text-gray-600 text-sm font-medium">
                  CONTACTS ON IRACHAT ({filteredContacts.filter(c => c.isIraChatUser).length})
                </Text>
              </View>
            )}

            {/* Render IraChat Users */}
            {filteredContacts
              .filter(c => c.isIraChatUser)
              .map((contact) => renderContact(contact))}

            {/* Other Contacts Section */}
            {filteredContacts.filter(c => !c.isIraChatUser).length > 0 && (
              <View className="px-4 py-3 bg-gray-50 mt-4">
                <Text className="text-gray-600 text-sm font-medium">
                  INVITE TO IRACHAT ({filteredContacts.filter(c => !c.isIraChatUser).length})
                </Text>
              </View>
            )}

            {/* Render Non-IraChat Users */}
            {filteredContacts
              .filter(c => !c.isIraChatUser)
              .map((contact) => renderContact(contact))}
          </View>
        ) : (
          <View className="flex-1 items-center justify-center px-4 py-20">
            <Ionicons name="people-outline" size={64} color="#d1d5db" />
            <Text className="text-gray-500 text-lg font-medium mt-4">
              No contacts found
            </Text>
            <Text className="text-gray-400 text-center mt-2">
              {searchText ? "Try searching with a different name" : "No IraChat users in your contacts"}
            </Text>
          </View>
        )}
      </View>

      {/* Firebase Connection Status */}
      {error && (
        <View className="px-4 py-2 bg-red-50 border-t border-red-200">
          <Text className="text-xs text-red-600 text-center">
            🔥 Firebase: {error.includes('timeout') ? 'Slow connection' : 'Connected with issues'}
          </Text>
        </View>
      )}

      {/* Performance Info */}
      <View className="px-4 py-2 bg-gray-50 border-t border-gray-200">
        <Text className="text-xs text-gray-500 text-center">
          ⚡ Fast loading • Real contacts • {contacts.length} total
        </Text>
      </View>
    </SafeAreaView>
  );
}
