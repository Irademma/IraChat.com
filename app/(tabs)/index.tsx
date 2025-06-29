// 💬 REAL CHAT LIST - Shows actual conversations!
// Fixed: Single export default, proper dependencies, optimized performance

import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
  Image,
  StyleSheet,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";
import ErrorBoundary from "../../src/components/ErrorBoundary";
import { MainHeader } from "../../src/components/MainHeader";
import { RootState } from "../../src/redux/store";
import { realTimeMessagingService, RealChat } from "../../src/services/realTimeMessagingService";
import { formatChatTime } from "../../src/utils/dateUtils";

// Optimized Chat Item Component with React.memo
const ChatItem = React.memo(({
  chat,
  currentUserId,
  onPress
}: {
  chat: RealChat;
  currentUserId: string;
  onPress: (chat: RealChat) => void;
}) => {
  // Memoize expensive calculations
  const chatData = useMemo(() => {
    const otherUserId = chat.participants.find(id => id !== currentUserId);
    const otherUserName = otherUserId ? chat.participantNames[otherUserId] : 'Unknown User';
    const otherUserAvatar = otherUserId ? chat.participantAvatars[otherUserId] : '';
    const unreadCount = chat.unreadCount[currentUserId] || 0;
    const formattedTime = formatChatTime(chat.lastMessageTime);

    return {
      otherUserId,
      otherUserName,
      otherUserAvatar,
      unreadCount,
      formattedTime,
    };
  }, [chat, currentUserId]);

  return (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() => onPress(chat)}
      activeOpacity={0.7}
    >
      <Image
        source={{
          uri: chatData.otherUserAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(chatData.otherUserName)}&background=667eea&color=fff`
        }}
        style={styles.chatAvatar}
      />

      <View style={styles.chatContent}>
        <View style={styles.chatHeader}>
          <Text style={styles.chatName}>{chatData.otherUserName}</Text>
          <Text style={styles.chatTime}>{chatData.formattedTime}</Text>
        </View>

        <View style={styles.chatFooter}>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {chat.lastMessage?.content || 'No messages yet'}
          </Text>
          {chatData.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>
                {chatData.unreadCount > 99 ? '99+' : chatData.unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
});

// Main Chat List Screen - SINGLE EXPORT DEFAULT
export default function ChatListScreen() {
  const router = useRouter();
  const [chats, setChats] = useState<RealChat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Get current user from Redux
  const currentUser = useSelector((state: RootState) => state.user.currentUser);

  console.log('💬 Chat List loaded for user:', currentUser?.id);

  // Subscribe to user's chats - FIXED DEPENDENCIES
  useEffect(() => {
    if (!currentUser?.id) {
      console.log('❌ No current user, cannot load chats');
      setIsLoading(false);
      return;
    }

    console.log('👂 Subscribing to user chats:', currentUser.id);
    setIsLoading(true);

    const unsubscribe = realTimeMessagingService.subscribeToUserChats(
      currentUser.id,
      (userChats: RealChat[]) => {
        console.log('📨 Received user chats:', userChats.length);
        setChats(userChats);
        setIsLoading(false);
      }
    );

    return () => {
      console.log('🧹 Cleaning up chat subscription');
      unsubscribe();
    };
  }, [currentUser?.id]); // FIXED: Proper dependency

  // Handle refresh - useCallback for performance
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    // Refresh happens automatically via real-time subscription
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  // Navigate to chat - useCallback for performance
  const openChat = useCallback(async (chat: RealChat) => {
    if (!currentUser) return;

    const otherUserId = chat.participants.find(id => id !== currentUser.id);
    const otherUserName = otherUserId ? chat.participantNames[otherUserId] : 'Unknown';
    const otherUserAvatar = otherUserId ? chat.participantAvatars[otherUserId] : '';

    console.log('🔗 Opening chat:', { chatId: chat.id, otherUserName });

    // FIXED: Use push() for normal navigation, not replace()
    router.push({
      pathname: '/chat/[id]',
      params: {
        id: chat.id,
        name: otherUserName,
        avatar: otherUserAvatar,
        userId: otherUserId,
      },
    });
  }, [currentUser, router]);

  // Start new chat - useCallback for performance
  const startNewChat = useCallback(() => {
    router.push('/contacts');
  }, [router]);

  // Render chat item - useCallback for FlatList performance
  const renderChatItem = useCallback(({ item }: { item: RealChat }) => {
    if (!currentUser) return null;

    return (
      <ChatItem
        chat={item}
        currentUserId={currentUser.id}
        onPress={openChat}
      />
    );
  }, [currentUser, openChat]);

  // Key extractor - useCallback for FlatList performance
  const keyExtractor = useCallback((item: RealChat) => item.id, []);

  // Render empty state
  const renderEmptyState = useCallback(() => (
    <View style={styles.emptyState}>
      <Ionicons name="chatbubbles-outline" size={80} color="#9CA3AF" />
      <Text style={styles.emptyTitle}>No conversations yet</Text>
      <Text style={styles.emptySubtitle}>
        Start a conversation with your contacts
      </Text>
      <TouchableOpacity style={styles.startChatButton} onPress={startNewChat}>
        <Ionicons name="add" size={24} color="#FFFFFF" />
        <Text style={styles.startChatText}>Start New Chat</Text>
      </TouchableOpacity>
    </View>
  ), [startNewChat]);

  return (
    <ErrorBoundary>
      <View style={styles.container}>
        <MainHeader />

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#667eea" />
            <Text style={styles.loadingText}>Loading chats...</Text>
          </View>
        ) : (
          <FlatList
            data={chats}
            renderItem={renderChatItem}
            keyExtractor={keyExtractor}
            contentContainerStyle={chats.length === 0 ? styles.emptyContainer : styles.chatsList}
            ListEmptyComponent={renderEmptyState}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={['#667eea']}
                tintColor="#667eea"
              />
            }
            showsVerticalScrollIndicator={false}
            // Performance optimizations
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            windowSize={10}
            getItemLayout={(data, index) => ({
              length: 76, // Approximate height of chat item
              offset: 76 * index,
              index,
            })}
          />
        )}

        {/* Floating Action Button */}
        <TouchableOpacity style={styles.fab} onPress={startNewChat}>
          <Ionicons name="add" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
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
  emptyContainer: {
    flex: 1,
  },
  chatsList: {
    paddingVertical: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  startChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#667eea',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  startChatText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    height: 76, // Fixed height for getItemLayout optimization
  },
  chatAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  chatContent: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  chatTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  chatFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    flex: 1,
    fontSize: 14,
    color: '#6B7280',
    marginRight: 8,
  },
  unreadBadge: {
    backgroundColor: '#667eea',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});