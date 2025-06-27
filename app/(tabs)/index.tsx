import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { db } from "../../src/services/firebaseSimple";

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useDispatch } from "react-redux";
import ErrorBoundary from "../../src/components/ErrorBoundary";
import { MainHeader } from "../../src/components/MainHeader";
import { Chat } from "../../src/types";
import { formatChatTime } from "../../src/utils/dateUtils";

// Design system and improved components

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

  // Mock data for testing (additive, doesn't replace live functionality)
  const { mockChats, shouldUseMockData } = require("../../src/hooks/useMockData").useMockChats();

  const router = useRouter();
  const dispatch = useDispatch();

  // Responsive design hooks (commented out as not currently used)
  // const { isXSmall, isSmall } = { isXSmall: false, isSmall: false };

  // Tab navigation with animations (currently unused but available for future features)
  // const { navigateNext, navigatePrevious, currentTabIndex, getTabInfo } = useTabNavigation({
  //   enableHaptics: true,
  //   animationDuration: 300,
  // });

  // Real contacts will be loaded from device contacts
  // No more mock data - use real contact names from device

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

  // Removed swipe hint logic to reduce complexity

  // Removed FAB-related useEffect hooks

  const filterChats = () => {
    // Combine live chats with mock data for testing (additive approach)
    let allChats = [...chats];

    // Add mock data if enabled and available (only when no real chats exist)
    if (shouldUseMockData && mockChats && mockChats.length > 0 && allChats.length === 0) {
      // Convert mock chats to Chat format and add them
      const convertedMockChats = mockChats.map((mockChat: any) => ({
        id: `mock_${mockChat.id}`,
        name: mockChat.name || mockChat.participantNames.find((name: string) => name !== 'You'),
        participants: mockChat.participantNames,
        lastMessage: mockChat.lastMessage.content,
        lastMessageAt: mockChat.lastMessage.timestamp.toISOString(),
        unreadCount: mockChat.unreadCount,
        isGroup: mockChat.isGroup,
        isPinned: mockChat.isPinned,
        isMuted: mockChat.isMuted
      }));

      // Only add mock chats when no real chats exist (not overriding)
      allChats = [...convertedMockChats];
      console.log(`📊 Added ${convertedMockChats.length} mock chats for testing (no real chats found)`);
    }

    if (searchQuery.trim() === "") {
      setFilteredChats(allChats);
    } else {
      const query = searchQuery.toLowerCase().trim();
      const filtered = allChats.filter((chat) => {
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
    // TODO: Get real contact name from device contacts service
    // For now, return the phone number until contacts service is integrated
    return phoneNumber;
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
    // Real unread count from chat data - no fake data
    const hasUnread = (item.unreadCount || 0) > 0;
    const unreadCount = item.unreadCount || 0;

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
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: 'white',
        }}
        activeOpacity={0.7}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`Chat with ${displayName}${isGroup ? " group" : ""}${hasUnread ? `, ${unreadCount} unread messages` : ""}`}
        accessibilityHint="Tap to open this chat conversation"
      >
        <View style={{ position: 'relative' }}>
          {(() => {
            const Avatar = require("../../src/components/Avatar").Avatar;
            return (
              <Avatar
                name={displayName}
                imageUrl={item.avatar}
                size="medium"
                showOnlineStatus={false}
              />
            );
          })()}
        </View>

        <View style={{ flex: 1, marginLeft: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: '600',
                color: '#1f2937',
                flex: 1,
              }}
              numberOfLines={1}
            >
              {displayName}
            </Text>
            <Text
              style={{
                fontSize: 13, // Increased from 12 for better readability
                color: '#6b7280',
              }}
            >
              {getLastSeenTime(item.lastMessageAt)}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text
              style={{
                fontSize: 14,
                color: '#4b5563',
                flex: 1,
              }}
              numberOfLines={1}
            >
              {item.lastMessage || "No messages yet"}
            </Text>

            {hasUnread && (
              <View
                style={{
                  backgroundColor: '#667eea',
                  borderRadius: 10,
                  minWidth: 20,
                  height: 20,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginLeft: 8,
                  paddingHorizontal: 6,
                }}
              >
                <Text
                  style={{
                    color: 'white',
                    fontSize: 12, // Increased from 11 for better readability
                    fontWeight: '600',
                  }}
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

  // Clean chats screen layout
  return (
    <ErrorBoundary>
      <View
        style={{
          flex: 1,
          backgroundColor: '#E6F3FF', // IraChat signature light blue background
        }}
        accessible={true}
        accessibilityLabel="Chats list screen"
      >
        {/* Main Header with Menu Icon */}
        <MainHeader
          onSearchResults={(results) => {
            console.log('Search results:', results);
          }}
          searchPlaceholder="Search chats, users, messages..."
        />

        {/* Main Content Area */}
        {isLoadingChats ? (
          // Clean loading state
          <View style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical: 60,
            backgroundColor: '#FFFFFF'
          }}>
            <ActivityIndicator size="large" color="#667eea" />
            <Text style={{
              marginTop: 16,
              fontSize: 16,
              color: '#6B7280',
              fontWeight: '500'
            }}>
              Loading your chats...
            </Text>
          </View>
      ) : filteredChats.length === 0 ? (
        searchQuery ? (
          (() => {
            const { SearchEmptyState } = require("../../src/components/EmptyStateImproved");
            return (
              <SearchEmptyState
                title="No chats found"
                subtitle={`No chats match "${searchQuery}"`}
                actionText="Clear Search"
                onActionPress={() => setSearchQuery("")}
              />
            );
          })()
        ) : (
          (() => {
            const { ChatsEmptyState } = require("../../src/components/EmptyStateImproved");
            return (
              <ChatsEmptyState
                onActionPress={() => router.push("/new-chat")}
              />
            );
          })()
        )
      ) : (
        <FlatList
          data={filteredChats}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={["#667eea"]}
              tintColor="#667eea"
            />
          }
          ItemSeparatorComponent={() => (
            <View style={{
              height: 1,
              backgroundColor: '#F3F4F6',
              marginLeft: 72
            }} />
          )}
          contentContainerStyle={{
            paddingBottom: 100, // Space for FAB
          }}
          style={{
            flex: 1,
            backgroundColor: 'transparent'
          }}
        />
      )}

        {/* Mock Data Indicator removed to avoid UI alignment issues */}

        {/* Floating Action Button for New Chat */}
        <TouchableOpacity
          onPress={() => router.push("/new-chat")}
          style={{
            position: 'absolute',
            bottom: 90, // Above tab bar
            right: 20,
            width: 56,
            height: 56,
            backgroundColor: '#667eea',
            borderRadius: 28,
            justifyContent: 'center',
            alignItems: 'center',
            elevation: 8,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.25,
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
    </ErrorBoundary>
  );
}
