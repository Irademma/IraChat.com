import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface PinnedMessage {
  id: string;
  content: string;
  sender: string;
  chatName: string;
  timestamp: string;
  type: 'text' | 'image' | 'video' | 'document';
  isGroup: boolean;
}

export default function PinnedMessagesScreen() {
  const router = useRouter();

  // Mock pinned messages data
  const [pinnedMessages] = useState<PinnedMessage[]>([
    {
      id: '1',
      content: 'Meeting tomorrow at 10 AM in the conference room. Please bring your laptops and project files.',
      sender: 'Sarah Johnson',
      chatName: 'Work Team',
      timestamp: '2024-12-01 14:30',
      type: 'text',
      isGroup: true,
    },
    {
      id: '2',
      content: 'Happy Birthday! 🎉🎂 Hope you have an amazing day!',
      sender: 'Mom',
      chatName: 'Family Group',
      timestamp: '2024-11-30 09:15',
      type: 'text',
      isGroup: true,
    },
    {
      id: '3',
      content: 'Don\'t forget to pick up groceries: milk, bread, eggs, and fruits.',
      sender: 'Alex',
      chatName: 'Alex',
      timestamp: '2024-11-29 16:45',
      type: 'text',
      isGroup: false,
    },
    {
      id: '4',
      content: 'Project deadline extended to next Friday. Great news!',
      sender: 'Project Manager',
      chatName: 'Development Team',
      timestamp: '2024-11-28 11:20',
      type: 'text',
      isGroup: true,
    },
    {
      id: '5',
      content: 'Photo shared: vacation_sunset.jpg',
      sender: 'Emma',
      chatName: 'Travel Buddies',
      timestamp: '2024-11-27 19:30',
      type: 'image',
      isGroup: true,
    },
  ]);

  const handleMessagePress = (message: PinnedMessage) => {
    Alert.alert(
      "Pinned Message",
      `From: ${message.sender}\nChat: ${message.chatName}\nTime: ${message.timestamp}`,
      [
        { text: "Go to Chat", onPress: () => console.log("Navigate to chat:", message.chatName) },
        { text: "Unpin", style: "destructive", onPress: () => console.log("Unpin message:", message.id) },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'image': return 'image-outline';
      case 'video': return 'videocam-outline';
      case 'document': return 'document-text-outline';
      default: return 'chatbubble-outline';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const renderPinnedMessage = ({ item }: { item: PinnedMessage }) => (
    <TouchableOpacity
      style={{
        backgroundColor: '#FFFFFF',
        marginHorizontal: 16,
        marginVertical: 6,
        padding: 16,
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#667eea',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
      onPress={() => handleMessagePress(item)}
    >
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
      }}>
        <View style={{
          width: 32,
          height: 32,
          borderRadius: 16,
          backgroundColor: '#F0F9FF',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 12,
        }}>
          <Ionicons name={getMessageIcon(item.type) as any} size={16} color="#667eea" />
        </View>
        
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{
              fontSize: 14,
              fontWeight: '600',
              color: '#374151',
              marginRight: 8,
            }}>
              {item.sender}
            </Text>
            {item.isGroup && (
              <View style={{
                backgroundColor: '#E5E7EB',
                paddingHorizontal: 6,
                paddingVertical: 2,
                borderRadius: 8,
              }}>
                <Text style={{
                  fontSize: 10,
                  fontWeight: '500',
                  color: '#6B7280',
                }}>
                  GROUP
                </Text>
              </View>
            )}
          </View>
          <Text style={{
            fontSize: 12,
            color: '#9CA3AF',
            marginTop: 2,
          }}>
            {item.chatName} • {formatTimestamp(item.timestamp)}
          </Text>
        </View>

        <Ionicons name="bookmark" size={20} color="#F59E0B" />
      </View>

      {/* Message Content */}
      <Text style={{
        fontSize: 15,
        color: '#374151',
        lineHeight: 22,
        marginLeft: 44,
      }}>
        {item.content}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#F0F9FF' }}>
      {/* Header */}
      <View style={{
        backgroundColor: '#667eea',
        paddingTop: 55,
        paddingBottom: 8,
        paddingHorizontal: 20,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ marginRight: 16, padding: 8 }}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={{
            fontSize: 20,
            fontWeight: 'bold',
            color: '#FFFFFF',
          }}>
            Pinned Messages
          </Text>
        </View>
      </View>

      {/* Info Banner */}
      <View style={{
        backgroundColor: '#FEF3C7',
        marginHorizontal: 16,
        marginTop: 16,
        padding: 12,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
      }}>
        <Ionicons name="information-circle" size={20} color="#F59E0B" style={{ marginRight: 8 }} />
        <Text style={{
          fontSize: 14,
          color: '#92400E',
          flex: 1,
        }}>
          Tap any pinned message to go to the original chat or unpin it
        </Text>
      </View>

      {/* Messages List */}
      <FlatList
        data={pinnedMessages}
        renderItem={renderPinnedMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingVertical: 8 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={{
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 80,
          }}>
            <Ionicons name="bookmark-outline" size={64} color="#9CA3AF" />
            <Text style={{
              fontSize: 18,
              fontWeight: '600',
              color: '#6B7280',
              marginTop: 16,
              marginBottom: 8,
            }}>
              No Pinned Messages
            </Text>
            <Text style={{
              fontSize: 14,
              color: '#9CA3AF',
              textAlign: 'center',
              paddingHorizontal: 40,
            }}>
              Messages you pin in chats will appear here for quick access
            </Text>
          </View>
        }
      />
    </View>
  );
}
