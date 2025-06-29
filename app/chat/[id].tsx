import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { View, ActivityIndicator, Alert } from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "../../src/redux/store";
import { ChatRoom } from "../../src/components/ChatRoom";
import { ComprehensiveGroupChatRoom } from "../../src/components/ComprehensiveGroupChatRoom";
import { realChatService } from "../../src/services/realChatService";

interface ChatData {
  id: string;
  name: string;
  avatar?: string;
  isGroup: boolean;
  isOnline?: boolean;
  lastSeen?: Date;
  participantIds: string[];
}

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  
  const [chatData, setChatData] = useState<ChatData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || !currentUser?.id) {
      setError("Invalid chat ID or user not authenticated");
      setLoading(false);
      return;
    }

    loadChatData();
  }, [id, currentUser]);

  const loadChatData = async () => {
    if (!id || !currentUser?.id) return;

    setLoading(true);
    setError(null);

    try {
      // Try to load chat data from the real chat service
      const result = await realChatService.getUserChats(currentUser.id);
      
      if (result.success && result.chats) {
        const chat = result.chats.find(c => c.id === id);
        
        if (chat) {
          setChatData({
            id: chat.id,
            name: chat.isGroup ? (chat.groupName || 'Group Chat') : (chat.participantName || 'Unknown User'),
            avatar: chat.isGroup ? chat.groupAvatar : chat.participantAvatar,
            isGroup: chat.isGroup || false,
            isOnline: true, // Default to online for now
            participantIds: chat.participantIds || [],
          });
        } else {
          // Chat not found in user's chats, create mock data
          setChatData({
            id: id,
            name: id.startsWith('group_') ? 'Group Chat' : 'Chat User',
            avatar: undefined,
            isGroup: id.startsWith('group_'),
            isOnline: true,
            participantIds: [currentUser.id, id],
          });
        }
      } else {
        // Service failed, create mock data based on ID
        setChatData({
          id: id,
          name: id.startsWith('group_') ? 'Group Chat' : 'Chat User',
          avatar: undefined,
          isGroup: id.startsWith('group_'),
          isOnline: true,
          participantIds: [currentUser.id, id],
        });
      }
    } catch (error) {
      console.error('Error loading chat data:', error);
      
      // Fallback to mock data
      setChatData({
        id: id,
        name: id.startsWith('group_') ? 'Group Chat' : 'Chat User',
        avatar: undefined,
        isGroup: id.startsWith('group_'),
        isOnline: true,
        participantIds: [currentUser.id, id],
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
      }}>
        <ActivityIndicator size="large" color="#87CEEB" />
      </View>
    );
  }

  if (error || !chatData) {
    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        padding: 20,
      }}>
        <Alert.alert(
          'Error',
          error || 'Failed to load chat data',
          [
            { text: 'Go Back', onPress: () => router.back() },
            { text: 'Retry', onPress: loadChatData },
          ]
        );
      </View>
    );
  }

  // Determine if current user is admin (for group chats)
  const isAdmin = chatData.isGroup && (
    currentUser?.id === chatData.participantIds[0] || // First participant is often the creator
    currentUser?.email?.includes('admin') || // Simple admin check
    false
  );

  // Render appropriate chat component
  if (chatData.isGroup) {
    return (
      <ComprehensiveGroupChatRoom
        groupId={chatData.id}
        groupName={chatData.name}
        groupAvatar={chatData.avatar}
        isAdmin={isAdmin}
      />
    );
  } else {
    return (
      <ChatRoom
        chatId={chatData.id}
        participantName={chatData.name}
        participantAvatar={chatData.avatar}
        isOnline={chatData.isOnline || false}
        lastSeen={chatData.lastSeen}
      />
    );
  }
}
