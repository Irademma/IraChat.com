import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  Image,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { db } from "../../src/services/firebaseSimple";

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Dimensions } from "react-native";
import { useDispatch } from "react-redux";
import EmptyState from "../../src/components/EmptyState";
import { Chat } from "../../src/types";
import { formatChatTime } from "../../src/utils/dateUtils";

// New User Welcome Component
interface NewUserWelcomeProps {
  onStartMessaging: () => void;
}

const NewUserWelcome: React.FC<NewUserWelcomeProps> = ({
  onStartMessaging,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const iconPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Simple entrance animation - no bounce
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // No pulse animation - keep icon static
    iconPulse.setValue(1);
  }, []);

  return (
    <Animated.View
      className="flex-1 items-center justify-center px-8"
      style={{
        opacity: fadeAnim,
        transform: [{ scale: scaleAnim }],
      }}
    >
      {/* Animated Icon Container */}
      <Animated.View
        className="mb-8 items-center justify-center"
        style={{
          transform: [{ scale: iconPulse }],
        }}
      >
        <View
          className="w-32 h-32 rounded-full items-center justify-center mb-4"
          style={{
            backgroundColor: "rgba(102, 126, 234, 0.1)",
            borderWidth: 2,
            borderColor: "rgba(102, 126, 234, 0.2)",
          }}
        >
          <View
            className="w-24 h-24 rounded-full items-center justify-center"
            style={{
              backgroundColor: "rgba(102, 126, 234, 0.15)",
            }}
          >
            <Ionicons name="chatbubbles" size={48} color="#667eea" />
          </View>
        </View>

        {/* Floating message bubbles */}
        <View className="absolute -top-2 -right-2">
          <View
            className="w-6 h-6 rounded-full items-center justify-center"
            style={{ backgroundColor: "#10B981" }}
          >
            <Ionicons name="heart" size={12} color="white" />
          </View>
        </View>
        <View className="absolute -bottom-2 -left-2">
          <View
            className="w-6 h-6 rounded-full items-center justify-center"
            style={{ backgroundColor: "#F59E0B" }}
          >
            <Ionicons name="star" size={12} color="white" />
          </View>
        </View>
      </Animated.View>

      {/* Welcome Text */}
      <Text
        className="text-2xl text-gray-800 text-center mb-3"
        style={{ fontWeight: "700" }}
      >
        Start messaging with your people
      </Text>

      <Text className="text-gray-500 text-center text-base leading-6 mb-8">
        Connect with friends and family who are already on IraChat. Tap below to
        see your contacts and start your first conversation.
      </Text>

      {/* Action Button */}
      <TouchableOpacity
        onPress={onStartMessaging}
        className="px-8 py-4 rounded-full items-center justify-center"
        style={{
          backgroundColor: "#667eea",
          elevation: 8,
          shadowColor: "#667eea",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
        }}
        activeOpacity={0.8}
      >
        <View className="flex-row items-center">
          <Ionicons
            name="people"
            size={20}
            color="white"
            style={{ marginRight: 8 }}
          />
          <Text className="text-white text-base" style={{ fontWeight: "600" }}>
            Find Your Contacts
          </Text>
        </View>
      </TouchableOpacity>

      {/* Subtle hint */}
      <Text className="text-gray-400 text-xs text-center mt-6">
        We&apos;ll show you contacts who are already using IraChat
      </Text>
    </Animated.View>
  );
};

// Real chats will be loaded from Firebase

export default function ChatsListScreen() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [filteredChats, setFilteredChats] = useState<Chat[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [isLoadingChats, setIsLoadingChats] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(true);

  // Get screen dimensions for responsive FAB positioning
  const { width, height } = Dimensions.get("window");
  const isLandscape = width > height;

  const router = useRouter();
  const dispatch = useDispatch();

  // Responsive design hooks (commented out as not currently used)
  // const { isXSmall, isSmall } = { isXSmall: false, isSmall: false };

  // Tab navigation with animations (currently unused but available for future features)
  // const { navigateNext, navigatePrevious, currentTabIndex, getTabInfo } = useTabNavigation({
  //   enableHaptics: true,
  //   animationDuration: 300,
  // });

  // Sample contacts for demonstration
  const mockContacts: { phoneNumber: string; name: string }[] = [
    { phoneNumber: "+256701234567", name: "John Doe" },
    { phoneNumber: "+256701234568", name: "Sarah Johnson" },
    { phoneNumber: "+256701234569", name: "Mike Wilson" },
    { phoneNumber: "+256701234570", name: "Emily Davis" },
    { phoneNumber: "+256701234571", name: "David Brown" },
  ];

  // Removed FAB animation functions - using other buttons for contact/group actions

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    // Load chats with Firebase fallback and proper cleanup
    const loadUserChats = async () => {
      try {
        // Check if Firebase is available and properly initialized
        if (!db || typeof db !== "object") {
          console.log(
            "📭 Firebase Firestore not available, showing empty chat list",
          );
          setChats([]);
          setIsLoadingChats(false);
          setHasLoadedOnce(true);
          return;
        }

        // Test if Firestore is actually working by trying to create a query
        try {
          const q = query(
            collection(db, "chats"),
            orderBy("lastMessageAt", "desc"),
          );

          unsubscribe = onSnapshot(
            q,
            (snapshot) => {
              const chatsData = snapshot.docs.map((doc) => {
                const data = doc.data();
                return {
                  id: doc.id,
                  ...data,
                } as Chat;
              });

              console.log("📥 Received chats from Firestore:", chatsData.length);
              console.log(
                "🔍 Chat loading state - isLoadingChats:",
                isLoadingChats,
                "hasLoadedOnce:",
                hasLoadedOnce,
              );
              console.log(
                "📋 Chat data:",
                chatsData.map((chat) => ({
                  id: chat.id,
                  name: chat.name,
                  isGroup: chat.isGroup,
                })),
              );

              setChats(chatsData);
              setIsLoadingChats(false);
              setHasLoadedOnce(true);

              // Debug log for new user detection
              if (chatsData.length === 0 && !hasLoadedOnce) {
                console.log("🎯 New user detected - will show NewUserWelcome");
              } else if (chatsData.length > 0) {
                console.log("📱 Existing user with chats - will show chat list");
              }
            },
            (error) => {
              console.error("❌ Firestore listener error:", error);
              setChats([]);
              setIsLoadingChats(false);
              setHasLoadedOnce(true);
            }
          );

        } catch (firestoreError) {
          console.error("❌ Firestore query failed:", firestoreError);
          throw firestoreError;
        }
      } catch (error) {
        console.error("❌ Error loading chats:", error);
        console.log("📭 Showing empty chat list due to Firebase error");
        setChats([]);
        setIsLoadingChats(false);
        setHasLoadedOnce(true);
      }
    };

    loadUserChats();

    // Cleanup function
    return () => {
      if (unsubscribe) {
        console.log("🧹 Cleaning up chat list listener");
        unsubscribe();
        unsubscribe = null;
      }
    };
  }, [dispatch]);

  useEffect(() => {
    filterChats();
  }, [searchQuery, chats]);

  // Removed FAB-related useEffect hooks

  const filterChats = () => {
    if (searchQuery.trim() === "") {
      setFilteredChats(chats);
    } else {
      const query = searchQuery.toLowerCase().trim();
      const filtered = chats.filter((chat) => {
        if (chat.name && chat.name.toLowerCase().includes(query)) return true;
        if (chat.lastMessage && chat.lastMessage.toLowerCase().includes(query))
          return true;
        if (
          chat.participants &&
          chat.participants.some(
            (p) =>
              p.toLowerCase().includes(query) ||
              getContactName(p).toLowerCase().includes(query),
          )
        )
          return true;
        return false;
      });
      setFilteredChats(filtered);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    // Reset loading state to show proper loading indicator
    setIsLoadingChats(true);
    console.log("🔄 Refreshing chats - resetting loading state");
    setTimeout(() => {
      setRefreshing(false);
      // Loading state will be set to false by the Firebase listener
    }, 1000);
  };

  // Removed FAB action handlers - using other navigation methods

  const getContactName = (phoneNumber: string) => {
    const contact = mockContacts.find((c) => c.phoneNumber === phoneNumber);
    return contact ? contact.name : phoneNumber;
  };

  const getLastSeenTime = (lastMessageAt: any) => {
    try {
      if (!lastMessageAt) return "Never";

      const now = new Date();
      let messageTime: Date;

      // Handle different date formats
      if (lastMessageAt.toDate) {
        // Firestore Timestamp
        messageTime = lastMessageAt.toDate();
      } else if (typeof lastMessageAt === "string") {
        // ISO string
        messageTime = new Date(lastMessageAt);
      } else if (lastMessageAt instanceof Date) {
        // Date object
        messageTime = lastMessageAt;
      } else {
        // Fallback
        messageTime = new Date(lastMessageAt);
      }

      // Validate the date
      if (isNaN(messageTime.getTime())) {
        return "Unknown";
      }

      const diffInMinutes = Math.floor(
        (now.getTime() - messageTime.getTime()) / (1000 * 60),
      );

      if (diffInMinutes < 1) return "Just now";
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
      if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;

      // Use formatChatTime safely
      try {
        return formatChatTime(messageTime);
      } catch (formatError) {
        console.warn("Error formatting chat time:", formatError);
        return `${Math.floor(diffInMinutes / 1440)}d ago`;
      }
    } catch (error) {
      console.error("Error in getLastSeenTime:", error);
      return "Unknown";
    }
  };

  const renderItem = ({ item }: { item: Chat }) => {
    const displayName =
      item.name || getContactName(item.participants?.[0] || "");
    const isGroup = item.isGroup;
    const hasUnread = Math.random() > 0.7;
    const unreadCount = hasUnread ? Math.floor(Math.random() * 5) + 1 : 0;

    return (
      <TouchableOpacity
        onPress={() => {
          try {
            console.log("🚀 Opening chat:", displayName);

            // Use replace for faster navigation
            router.replace(
              `/chat/${item.id}?name=${encodeURIComponent(displayName)}`,
            );
          } catch (error) {
            Alert.alert("Error", "Failed to open chat");
            console.error("Chat navigation error:", error);
          }
        }}
        className="flex-row items-center px-4 py-3 bg-white active:bg-gray-50"
        activeOpacity={0.7}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`Chat with ${displayName}${isGroup ? " group" : ""}${hasUnread ? `, ${unreadCount} unread messages` : ""}`}
        accessibilityHint="Tap to open this chat conversation"
      >
        <View className="relative">
          {item.avatar ? (
            <Image
              source={{ uri: item.avatar }}
              className="w-14 h-14 rounded-full"
            />
          ) : (
            <View
              className={`w-14 h-14 rounded-full items-center justify-center ${isGroup ? "bg-blue-500" : "bg-blue-500"}`}
              style={isGroup ? { backgroundColor: "#667eea" } : {}}
            >
              <Text
                className="text-white text-lg"
                style={{ fontWeight: "700" }}
              >
                {displayName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          {!isGroup && Math.random() > 0.6 && (
            <View
              className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white"
              style={{ backgroundColor: "#667eea" }}
            />
          )}
        </View>

        <View className="flex-1 ml-3">
          <View className="flex-row items-center justify-between mb-1">
            <Text
              className="text-gray-900 text-base"
              numberOfLines={1}
              style={{ fontWeight: "600" }}
            >
              {displayName}
            </Text>
            <Text className="text-gray-400 text-xs">
              {getLastSeenTime(item.lastMessageAt)}
            </Text>
          </View>

          <View className="flex-row items-center justify-between">
            <Text className="text-gray-600 text-sm flex-1" numberOfLines={1}>
              {item.lastMessage || "No messages yet"}
            </Text>

            {hasUnread && (
              <View
                className="rounded-full min-w-[20px] h-5 items-center justify-center ml-2"
                style={{ backgroundColor: "#667eea" }}
              >
                <Text
                  className="text-white text-xs"
                  style={{ fontWeight: "700" }}
                >
                  {unreadCount > 99 ? "99+" : unreadCount}
                </Text>
              </View>
            )}
          </View>

          {!isGroup && !item.name && (
            <Text className="text-gray-400 text-xs mt-1">
              {item.participants?.[0] || "Unknown number"}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View
      className="flex-1 bg-gray-50"
      accessible={true}
      accessibilityLabel="Chats list screen"
    >
      <View className="px-4 py-3 bg-white border-b border-gray-200">
        <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-2">
          <Ionicons
            name="search"
            size={20}
            color="#9CA3AF"
            accessible={true}
            accessibilityLabel="Search icon"
          />
          <TextInput
            placeholder="Search chats, messages..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="flex-1 ml-3 text-gray-700"
            placeholderTextColor="#9CA3AF"
            accessible={true}
            accessibilityLabel="Search chats input"
            accessibilityHint="Type to search through your chats and messages"
            accessibilityRole="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery("")}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Clear search"
              accessibilityHint="Tap to clear search text"
            >
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {isLoadingChats ? (
        // Show loading state while fetching chats
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#667eea" />
          <Text className="text-gray-500 mt-2">Loading your chats...</Text>
        </View>
      ) : filteredChats.length === 0 ? (
        searchQuery ? (
          <EmptyState
            icon={require("../../assets/images/comment.png")}
            title="No chats found"
            description={`No chats match "${searchQuery}"`}
            actionText="Clear Search"
            onAction={() => setSearchQuery("")}
          />
        ) : (
          // Only show NewUserWelcome when we've confirmed there are no chats
          <NewUserWelcome onStartMessaging={() => router.push("/new-chat")} />
        )
      ) : (
        <FlatList
          data={filteredChats}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          getItemLayout={(_data, index) => ({
            length: 80, // Approximate height of each chat item
            offset: 80 * index,
            index,
          })}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={10}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={["#667eea"]}
              tintColor="#667eea"
            />
          }
          ItemSeparatorComponent={() => (
            <View className="h-px bg-gray-200 ml-[72px]" />
          )}
          bounces={false}
          overScrollMode="never"
          scrollEventThrottle={16}
        />
      )}

      {/* Floating Action Button for New Chat */}
      <TouchableOpacity
        onPress={() => router.push("/new-chat")}
        className="absolute w-14 h-14 bg-blue-500 rounded-full items-center justify-center shadow-lg"
        style={{
          bottom: isLandscape ? 80 : 24, // Higher position in landscape to avoid search bar
          right: 24,
          elevation: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
        }}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Start new chat"
        accessibilityHint="Tap to start a new conversation"
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}
