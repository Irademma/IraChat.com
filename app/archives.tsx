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

interface ArchivedChat {
  id: string;
  name: string;
  lastMessage: string;
  lastMessageTime: string;
  isGroup: boolean;
  memberCount?: number;
  unreadCount: number;
  avatar?: string;
  archivedDate: string;
}

export default function ArchivesScreen() {
  const router = useRouter();

  // Mock archived chats data
  const [archivedChats] = useState<ArchivedChat[]>([
    {
      id: '1',
      name: 'Old Work Group',
      lastMessage: 'Thanks everyone for the great project!',
      lastMessageTime: '2024-10-15',
      isGroup: true,
      memberCount: 8,
      unreadCount: 0,
      archivedDate: '2024-10-20',
    },
    {
      id: '2',
      name: 'College Friends',
      lastMessage: 'See you all at the reunion!',
      lastMessageTime: '2024-09-28',
      isGroup: true,
      memberCount: 12,
      unreadCount: 3,
      archivedDate: '2024-10-01',
    },
    {
      id: '3',
      name: 'Sarah (Ex-Colleague)',
      lastMessage: 'Good luck with your new job!',
      lastMessageTime: '2024-08-15',
      isGroup: false,
      unreadCount: 0,
      archivedDate: '2024-08-20',
    },
    {
      id: '4',
      name: 'Apartment Hunting',
      lastMessage: 'Found the perfect place, thanks!',
      lastMessageTime: '2024-07-22',
      isGroup: true,
      memberCount: 5,
      unreadCount: 1,
      archivedDate: '2024-08-01',
    },
    {
      id: '5',
      name: 'Mike Thompson',
      lastMessage: 'Happy to help anytime!',
      lastMessageTime: '2024-06-10',
      isGroup: false,
      unreadCount: 0,
      archivedDate: '2024-07-15',
    },
  ]);

  const handleChatPress = (chat: ArchivedChat) => {
    Alert.alert(
      chat.name,
      `Archived on: ${chat.archivedDate}\nLast message: ${chat.lastMessageTime}`,
      [
        { text: "Unarchive", onPress: () => console.log("Unarchive chat:", chat.name) },
        { text: "Delete Forever", style: "destructive", onPress: () => console.log("Delete chat:", chat.name) },
        { text: "Open Chat", onPress: () => console.log("Open archived chat:", chat.name) },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;
    if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    if (diffDays <= 365) return `${Math.ceil(diffDays / 30)} months ago`;
    return `${Math.ceil(diffDays / 365)} years ago`;
  };

  const renderArchivedChat = ({ item }: { item: ArchivedChat }) => (
    <TouchableOpacity
      style={{
        backgroundColor: '#FFFFFF',
        marginHorizontal: 16,
        marginVertical: 4,
        padding: 16,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
      }}
      onPress={() => handleChatPress(item)}
    >
      {/* Avatar */}
      <View style={{
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: item.isGroup ? '#E5E7EB' : '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
      }}>
        {item.avatar ? (
          <Text style={{ fontSize: 20 }}>👤</Text>
        ) : (
          <Ionicons 
            name={item.isGroup ? "people" : "person"} 
            size={24} 
            color="#9CA3AF" 
          />
        )}
      </View>

      {/* Chat Info */}
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
          <Text style={{
            fontSize: 16,
            fontWeight: '600',
            color: '#374151',
            flex: 1,
          }} numberOfLines={1}>
            {item.name}
          </Text>
          
          {item.unreadCount > 0 && (
            <View style={{
              backgroundColor: '#EF4444',
              borderRadius: 10,
              minWidth: 20,
              height: 20,
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: 8,
            }}>
              <Text style={{
                color: '#FFFFFF',
                fontSize: 12,
                fontWeight: '600',
              }}>
                {item.unreadCount > 99 ? '99+' : item.unreadCount}
              </Text>
            </View>
          )}
        </View>

        <Text style={{
          fontSize: 14,
          color: '#6B7280',
          marginBottom: 4,
        }} numberOfLines={1}>
          {item.lastMessage}
        </Text>

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {item.isGroup && (
            <Text style={{
              fontSize: 12,
              color: '#9CA3AF',
              marginRight: 8,
            }}>
              {item.memberCount} members •
            </Text>
          )}
          <Text style={{
            fontSize: 12,
            color: '#9CA3AF',
          }}>
            Archived {formatDate(item.archivedDate)}
          </Text>
        </View>
      </View>

      {/* Archive Icon */}
      <View style={{
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 8,
      }}>
        <Ionicons name="archive" size={16} color="#6B7280" />
      </View>
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
            Archives
          </Text>
        </View>
      </View>

      {/* Info Banner */}
      <View style={{
        backgroundColor: '#E0F2FE',
        marginHorizontal: 16,
        marginTop: 16,
        padding: 12,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
      }}>
        <Ionicons name="information-circle" size={20} color="#0284C7" style={{ marginRight: 8 }} />
        <Text style={{
          fontSize: 14,
          color: '#0C4A6E',
          flex: 1,
        }}>
          Archived chats are hidden from your main chat list but not deleted
        </Text>
      </View>

      {/* Archives List */}
      <FlatList
        data={archivedChats}
        renderItem={renderArchivedChat}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingVertical: 8 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={{
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 80,
          }}>
            <Ionicons name="archive-outline" size={64} color="#9CA3AF" />
            <Text style={{
              fontSize: 18,
              fontWeight: '600',
              color: '#6B7280',
              marginTop: 16,
              marginBottom: 8,
            }}>
              No Archived Chats
            </Text>
            <Text style={{
              fontSize: 14,
              color: '#9CA3AF',
              textAlign: 'center',
              paddingHorizontal: 40,
            }}>
              Chats you archive will appear here. They'll be hidden from your main chat list.
            </Text>
          </View>
        }
      />
    </View>
  );
}
