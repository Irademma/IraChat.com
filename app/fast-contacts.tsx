import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  ScrollView,
  Share,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth } from "../src/services/firebaseSimple";
import { chatService } from "../src/services/firestoreService";
import optimizedContactsService from "../src/services/optimizedContactsService";

export default function FastContactsScreen() {
  const router = useRouter();
  const [searchText, setSearchText] = useState("");
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load contacts on component mount - FAST!
  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      setIsLoading(true);
      console.log("🚀 Loading contacts with optimized service...");
      
      const contactsList = await optimizedContactsService.getIraChatContacts();
      setContacts(contactsList);
      setFilteredContacts(contactsList);
      
      console.log(`✅ Loaded ${contactsList.length} contacts FAST!`);
    } catch (error) {
      console.error("❌ Error loading contacts:", error);
    } finally {
      setIsLoading(false);
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
    if (text.trim() === "") {
      setFilteredContacts(contacts);
    } else {
      const filtered = contacts.filter((contact) =>
        contact.name.toLowerCase().includes(text.toLowerCase()) ||
        contact.phoneNumber.includes(text)
      );
      setFilteredContacts(filtered);
    }
  };

  const openChat = async (contact: any) => {
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
        [currentUser.uid, contact.userId],
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

  const handleInviteContact = (contact: any) => {
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

  const renderContact = (contact: any, index: number) => {
    return (
      <TouchableOpacity
        key={contact.id}
        onPress={() => openChat(contact)}
        className="flex-row items-center px-4 py-3 border-b border-gray-100"
        activeOpacity={0.7}
      >
        <View className="relative">
          <Image
            source={{ uri: contact.avatar }}
            className="w-12 h-12 rounded-full"
          />
          {contact.isOnline && (
            <View className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
          )}
        </View>

        <View className="flex-1 ml-3">
          <Text className="text-gray-900 font-semibold text-base">
            {contact.name}
          </Text>
          <View className="flex-row items-center mt-1">
            {contact.isOnline ? (
              <Text className="text-green-600 text-sm font-medium">Online</Text>
            ) : (
              <Text className="text-gray-500 text-sm">
                Last seen {formatLastSeen(contact.lastSeen)}
              </Text>
            )}
          </View>
        </View>

        <View className="items-center">
          {contact.isIraChatUser ? (
            <>
              <View className="bg-sky-100 rounded-full p-2">
                <Ionicons name="chatbubble" size={16} color="#0ea5e9" />
              </View>
              <Text className="text-xs text-sky-600 mt-1 font-medium">Chat</Text>
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
      <ScrollView className="flex-1">
        {isLoading ? (
          <View className="flex-1 items-center justify-center py-20">
            <ActivityIndicator size="large" color="#0ea5e9" />
            <Text className="text-gray-500 mt-4">Loading your contacts...</Text>
            <Text className="text-gray-400 text-sm mt-2">Using optimized loading</Text>
          </View>
        ) : filteredContacts.length > 0 ? (
          <>
            {/* IraChat Users Section */}
            {filteredContacts.filter(c => c.isIraChatUser).length > 0 && (
              <>
                <View className="px-4 py-3 bg-gray-50">
                  <Text className="text-gray-600 text-sm font-medium">
                    CONTACTS ON IRACHAT ({filteredContacts.filter(c => c.isIraChatUser).length})
                  </Text>
                </View>
                {filteredContacts
                  .filter(c => c.isIraChatUser)
                  .map((contact, index) => renderContact(contact, index))}
              </>
            )}

            {/* Other Contacts Section */}
            {filteredContacts.filter(c => !c.isIraChatUser).length > 0 && (
              <>
                <View className="px-4 py-3 bg-gray-50">
                  <Text className="text-gray-600 text-sm font-medium">
                    INVITE TO IRACHAT ({filteredContacts.filter(c => !c.isIraChatUser).length})
                  </Text>
                </View>
                {filteredContacts
                  .filter(c => !c.isIraChatUser)
                  .slice(0, 10) // Limit to 10 for performance
                  .map((contact, index) => renderContact(contact, index))}
              </>
            )}
          </>
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
      </ScrollView>

      {/* Firebase Debug Panel */}
      <FirebaseDebugger />

      {/* Firestore Collection Tester */}
      <View style={{
        backgroundColor: 'white',
        padding: 16,
        margin: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3
      }}>
        <Text style={{
          fontSize: 16,
          fontWeight: 'bold',
          color: '#1f2937',
          marginBottom: 16,
          textAlign: 'center'
        }}>
          🔧 Fix Firestore Collections
        </Text>
        <Text style={{
          fontSize: 14,
          color: '#6b7280',
          marginBottom: 16,
          textAlign: 'center'
        }}>
          If you're getting permission errors, tap below to create missing collections
        </Text>
        <TouchableOpacity
          onPress={() => {
            // Simple collection creation without the complex component
            console.log("🔧 Creating basic collections...");
            Alert.alert(
              "Create Collections",
              "This will create the basic Firestore collections needed for IraChat. Continue?",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Create",
                  onPress: async () => {
                    try {
                      const { collection, addDoc, doc, setDoc } = await import('firebase/firestore');
                      const { db, auth } = await import('../src/services/firebaseSimple');

                      const currentUser = auth?.currentUser;
                      if (!currentUser) {
                        Alert.alert("Error", "Please log in first");
                        return;
                      }

                      console.log("🔧 Creating users collection...");
                      // Create a basic user document (PHONE-BASED)
                      await addDoc(collection(db, 'users'), {
                        uid: currentUser.uid,
                        phoneNumber: currentUser.phoneNumber || '+1234567890',
                        displayName: 'IraChat User',
                        isOnline: true,
                        lastSeen: new Date(),
                        createdAt: new Date(),
                        avatar: 'https://via.placeholder.com/150/87CEEB/FFFFFF?text=U',
                        status: 'Available'
                      });

                      console.log("🔧 Creating contacts collection...");
                      // Create contacts collection with sample data
                      await addDoc(collection(db, 'contacts'), {
                        userId: currentUser.uid,
                        phoneNumber: '+1234567890',
                        displayName: 'Alice Johnson',
                        isIraChatUser: true,
                        createdAt: new Date(),
                        avatar: 'https://via.placeholder.com/150/FF6B6B/FFFFFF?text=A'
                      });

                      await addDoc(collection(db, 'contacts'), {
                        userId: currentUser.uid,
                        phoneNumber: '+1234567891',
                        displayName: 'Bob Smith',
                        isIraChatUser: true,
                        createdAt: new Date(),
                        avatar: 'https://via.placeholder.com/150/4ECDC4/FFFFFF?text=B'
                      });

                      await addDoc(collection(db, 'contacts'), {
                        userId: currentUser.uid,
                        phoneNumber: '+1234567892',
                        displayName: 'Charlie Brown',
                        isIraChatUser: false,
                        createdAt: new Date(),
                        avatar: 'https://via.placeholder.com/150/45B7D1/FFFFFF?text=C'
                      });

                      console.log("🔧 Creating chats collection...");
                      // Create a sample chat
                      await addDoc(collection(db, 'chats'), {
                        participants: [currentUser.uid, 'sample-user-1'],
                        name: 'Sample Chat',
                        isGroup: false,
                        lastMessage: 'Hello! This is a test message.',
                        lastMessageAt: new Date(),
                        createdAt: new Date()
                      });

                      console.log("🔧 Creating additional collections for ANY user...");

                      // Create reactions collection (for any user's message reactions)
                      await addDoc(collection(db, 'reactions'), {
                        messageId: "placeholder",
                        chatId: "placeholder",
                        userId: "placeholder",
                        emoji: "👍",
                        createdAt: new Date()
                      });

                      // Create voiceMessages collection (for any user's voice notes)
                      await addDoc(collection(db, 'voiceMessages'), {
                        senderId: "placeholder",
                        chatId: "placeholder",
                        audioUrl: "placeholder",
                        duration: 0,
                        waveform: [],
                        createdAt: new Date(),
                        fileSize: 0
                      });

                      // Create updates collection (for any user's TikTok-style posts)
                      await addDoc(collection(db, 'updates'), {
                        userId: "placeholder",
                        type: "video",
                        mediaUrl: "placeholder",
                        thumbnailUrl: "placeholder",
                        caption: "placeholder",
                        createdAt: new Date(),
                        duration: 0,
                        viewCount: 0,
                        likeCount: 0,
                        commentCount: 0,
                        isPublic: true
                      });

                      // Create updateViews collection (track any user's update views)
                      await addDoc(collection(db, 'updateViews'), {
                        updateId: "placeholder",
                        viewerId: "placeholder",
                        viewedAt: new Date()
                      });

                      // Create updateLikes collection (track any user's update likes)
                      await addDoc(collection(db, 'updateLikes'), {
                        updateId: "placeholder",
                        userId: "placeholder",
                        likedAt: new Date()
                      });

                      // Create callLogs collection (for any user's call history)
                      await addDoc(collection(db, 'callLogs'), {
                        participants: ["placeholder"],
                        type: "voice",
                        initiator: "placeholder",
                        startTime: new Date(),
                        endTime: new Date(),
                        duration: 0,
                        status: "completed",
                        quality: "good"
                      });

                      // Create activeCalls collection (for any user's active calls)
                      await addDoc(collection(db, 'activeCalls'), {
                        participants: ["placeholder"],
                        type: "voice",
                        initiator: "placeholder",
                        startedAt: new Date(),
                        status: "ringing",
                        callId: "placeholder"
                      });

                      // Create onlineStatus collection (for any user's online status)
                      await addDoc(collection(db, 'onlineStatus'), {
                        userId: "placeholder",
                        isOnline: false,
                        lastSeen: new Date(),
                        status: "Available"
                      });

                      // Create lastSeen collection (for any user's last seen)
                      await addDoc(collection(db, 'lastSeen'), {
                        userId: "placeholder",
                        timestamp: new Date(),
                        isVisible: true
                      });

                      // Create notifications collection (for any user's notifications)
                      await addDoc(collection(db, 'notifications'), {
                        userId: "placeholder",
                        type: "message",
                        title: "placeholder",
                        body: "placeholder",
                        data: {},
                        createdAt: new Date(),
                        read: false,
                        delivered: true
                      });

                      // Create encryptionKeys collection (for any user's encryption)
                      await addDoc(collection(db, 'encryptionKeys'), {
                        userId: "placeholder",
                        publicKey: "placeholder",
                        keyId: "placeholder",
                        createdAt: new Date(),
                        algorithm: "RSA-2048"
                      });

                      // Create phoneVerification collection (for any user's phone verification)
                      await addDoc(collection(db, 'phoneVerification'), {
                        phoneNumber: "placeholder",
                        verified: false,
                        verifiedAt: new Date(),
                        userId: "placeholder",
                        attempts: 0
                      });

                      // Create messageStatus collection (for any user's message status)
                      await addDoc(collection(db, 'messageStatus'), {
                        messageId: "placeholder",
                        chatId: "placeholder",
                        senderId: "placeholder",
                        recipientId: "placeholder",
                        status: "sent",
                        timestamp: new Date()
                      });

                      // Create typing collection structure (for any user's typing indicators)
                      const typingRef = collection(db, 'typing');
                      const chatTypingRef = doc(typingRef, 'placeholder-chat');
                      const usersTypingRef = collection(chatTypingRef, 'users');
                      await setDoc(doc(usersTypingRef, 'placeholder-user'), {
                        isTyping: false,
                        lastTypingAt: new Date()
                      });

                      // Create downloads collection (for any user's downloads)
                      await addDoc(collection(db, 'downloads'), {
                        userId: "placeholder",
                        mediaId: "placeholder",
                        downloadedAt: new Date(),
                        fileSize: 0,
                        downloadPath: "placeholder"
                      });

                      // Create chatExports collection (for any user's chat exports)
                      await addDoc(collection(db, 'chatExports'), {
                        userId: "placeholder",
                        chatId: "placeholder",
                        exportedAt: new Date(),
                        format: "json",
                        fileUrl: "placeholder",
                        messageCount: 0
                      });

                      // Create backups collection (for any user's backups)
                      await addDoc(collection(db, 'backups'), {
                        userId: "placeholder",
                        backupAt: new Date(),
                        backupUrl: "placeholder",
                        backupSize: 0,
                        includesMedia: false,
                        chatCount: 0,
                        messageCount: 0
                      });

                      // Create userSessions collection (for any user's sessions)
                      await addDoc(collection(db, 'userSessions'), {
                        userId: "placeholder",
                        deviceId: "placeholder",
                        deviceName: "placeholder",
                        platform: "android",
                        appVersion: "1.0.0",
                        loginAt: new Date(),
                        lastActiveAt: new Date(),
                        ipAddress: "placeholder",
                        location: "placeholder"
                      });

                      // Create navigationState collection (for any user's navigation)
                      await addDoc(collection(db, 'navigationState'), {
                        userId: "placeholder",
                        currentTab: "chats",
                        lastVisitedChat: "placeholder",
                        lastUpdatedAt: new Date()
                      });

                      // Create engagementMetrics collection (for any user's engagement)
                      await addDoc(collection(db, 'engagementMetrics'), {
                        userId: "placeholder",
                        updateId: "placeholder",
                        action: "view",
                        timestamp: new Date(),
                        duration: 0,
                        deviceType: "mobile"
                      });

                      // Create sharedContent collection (for any user's shared content)
                      await addDoc(collection(db, 'sharedContent'), {
                        sharedBy: "placeholder",
                        sharedWith: ["placeholder"],
                        contentType: "image",
                        contentUrl: "placeholder",
                        sharedAt: new Date(),
                        expiresAt: new Date(),
                        downloadCount: 0
                      });

                      console.log("✅ All collections created successfully!");
                      Alert.alert("Success", "All IraChat collections created! Your database is now complete.");
                    } catch (error: any) {
                      Alert.alert("Error", `Failed to create collections: ${error.message}`);
                    }
                  }
                }
              ]
            );
          }}
          style={{
            backgroundColor: '#87CEEB',
            paddingVertical: 12,
            paddingHorizontal: 24,
            borderRadius: 8,
            alignItems: 'center'
          }}
        >
          <Text style={{
            color: 'white',
            fontSize: 16,
            fontWeight: '600'
          }}>
            Create Collections
          </Text>
        </TouchableOpacity>
      </View>

      {/* Performance Info */}
      <View className="px-4 py-2 bg-gray-50 border-t border-gray-200">
        <Text className="text-xs text-gray-500 text-center">
          ⚡ Optimized loading • Cached for 5 minutes • {contacts.length} total contacts
        </Text>
      </View>
    </SafeAreaView>
  );
}
