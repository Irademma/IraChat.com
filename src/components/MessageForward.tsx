// ↗️ MESSAGE FORWARD - Forward messages to other chats
// WhatsApp-style message forwarding with contact/chat selection

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RealMessage, RealChat, realTimeMessagingService } from '../services/realTimeMessagingService';

interface MessageForwardProps {
  message: RealMessage | null;
  isVisible: boolean;
  onClose: () => void;
  onForward: (chatIds: string[], message: RealMessage) => void;
  currentUserId: string;
}

interface ForwardableChat {
  id: string;
  name: string;
  avatar?: string;
  isGroup: boolean;
  lastSeen?: string;
  selected: boolean;
}

export const MessageForward: React.FC<MessageForwardProps> = ({
  message,
  isVisible,
  onClose,
  onForward,
  currentUserId,
}) => {
  const [chats, setChats] = useState<ForwardableChat[]>([]);
  const [filteredChats, setFilteredChats] = useState<ForwardableChat[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChats, setSelectedChats] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load user's chats when modal opens
  useEffect(() => {
    if (isVisible && currentUserId) {
      loadChats();
    }
  }, [isVisible, currentUserId]);

  // Filter chats based on search
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredChats(chats);
    } else {
      const filtered = chats.filter(chat =>
        chat.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredChats(filtered);
    }
  }, [searchQuery, chats]);

  // Load user's chats
  const loadChats = async () => {
    setIsLoading(true);
    try {
      // Subscribe to user's chats
      const unsubscribe = realTimeMessagingService.subscribeToUserChats(
        currentUserId,
        (userChats: RealChat[]) => {
          const forwardableChats: ForwardableChat[] = userChats
            .filter(chat => chat.id !== message?.chatId) // Exclude current chat
            .map(chat => {
              const otherUserId = chat.participants.find(id => id !== currentUserId);
              const chatName = chat.isGroup 
                ? chat.groupName || 'Group Chat'
                : otherUserId 
                  ? chat.participantNames[otherUserId] || 'Unknown User'
                  : 'Unknown Chat';
              
              const chatAvatar = chat.isGroup
                ? chat.groupAvatar
                : otherUserId
                  ? chat.participantAvatars[otherUserId]
                  : undefined;

              return {
                id: chat.id,
                name: chatName,
                avatar: chatAvatar,
                isGroup: chat.isGroup,
                selected: false,
              };
            });

          setChats(forwardableChats);
          setIsLoading(false);
        }
      );

      // Cleanup subscription when modal closes
      return () => unsubscribe();
    } catch (error) {
      console.error('❌ Error loading chats:', error);
      setIsLoading(false);
    }
  };

  // Toggle chat selection
  const toggleChatSelection = (chatId: string) => {
    setSelectedChats(prev => {
      if (prev.includes(chatId)) {
        return prev.filter(id => id !== chatId);
      } else {
        return [...prev, chatId];
      }
    });

    setChats(prev => prev.map(chat => 
      chat.id === chatId 
        ? { ...chat, selected: !chat.selected }
        : chat
    ));
  };

  // Handle forward
  const handleForward = () => {
    if (selectedChats.length === 0) {
      Alert.alert('No Selection', 'Please select at least one chat to forward to.');
      return;
    }

    if (!message) {
      Alert.alert('Error', 'No message to forward.');
      return;
    }

    const chatNames = chats
      .filter(chat => selectedChats.includes(chat.id))
      .map(chat => chat.name)
      .join(', ');

    Alert.alert(
      'Forward Message',
      `Forward this message to ${selectedChats.length} chat(s)?\n\n${chatNames}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Forward',
          onPress: () => {
            onForward(selectedChats, message);
            handleClose();
          },
        },
      ]
    );
  };

  // Handle close
  const handleClose = () => {
    setSearchQuery('');
    setSelectedChats([]);
    setChats(prev => prev.map(chat => ({ ...chat, selected: false })));
    onClose();
  };

  // Render chat item
  const renderChatItem = ({ item }: { item: ForwardableChat }) => (
    <TouchableOpacity
      style={[styles.chatItem, item.selected && styles.selectedChatItem]}
      onPress={() => toggleChatSelection(item.id)}
    >
      <View style={styles.chatItemLeft}>
        <Image
          source={{
            uri: item.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=667eea&color=fff`
          }}
          style={styles.chatAvatar}
        />
        <View style={styles.chatInfo}>
          <Text style={styles.chatName}>{item.name}</Text>
          {item.isGroup && (
            <Text style={styles.groupLabel}>Group</Text>
          )}
        </View>
      </View>
      
      <View style={styles.chatItemRight}>
        {item.selected ? (
          <Ionicons name="checkmark-circle" size={24} color="#667eea" />
        ) : (
          <View style={styles.unselectedCircle} />
        )}
      </View>
    </TouchableOpacity>
  );

  // Render message preview
  const renderMessagePreview = () => {
    if (!message) return null;

    return (
      <View style={styles.messagePreview}>
        <View style={styles.previewHeader}>
          <Ionicons name="arrow-forward" size={16} color="#6B7280" />
          <Text style={styles.previewLabel}>Forwarding</Text>
        </View>
        <View style={styles.previewContent}>
          <Text style={styles.previewText} numberOfLines={2}>
            {message.content}
          </Text>
          {message.type !== 'text' && (
            <View style={styles.mediaIndicator}>
              <Ionicons 
                name={
                  message.type === 'image' ? 'image' :
                  message.type === 'video' ? 'videocam' :
                  message.type === 'audio' ? 'mic' : 'document'
                } 
                size={16} 
                color="#6B7280" 
              />
              <Text style={styles.mediaLabel}>
                {message.type.charAt(0).toUpperCase() + message.type.slice(1)}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.title}>Forward Message</Text>
          <TouchableOpacity 
            onPress={handleForward}
            style={[styles.forwardButton, selectedChats.length === 0 && styles.disabledButton]}
            disabled={selectedChats.length === 0}
          >
            <Text style={[styles.forwardButtonText, selectedChats.length === 0 && styles.disabledText]}>
              Forward
            </Text>
          </TouchableOpacity>
        </View>

        {/* Message Preview */}
        {renderMessagePreview()}

        {/* Search */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search chats..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Selected Count */}
        {selectedChats.length > 0 && (
          <View style={styles.selectedCount}>
            <Text style={styles.selectedCountText}>
              {selectedChats.length} chat{selectedChats.length !== 1 ? 's' : ''} selected
            </Text>
          </View>
        )}

        {/* Chat List */}
        <View style={styles.chatList}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#667eea" />
              <Text style={styles.loadingText}>Loading chats...</Text>
            </View>
          ) : filteredChats.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="chatbubbles-outline" size={64} color="#E5E7EB" />
              <Text style={styles.emptyTitle}>No Chats Found</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery ? `No chats match "${searchQuery}"` : 'No chats available to forward to'}
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredChats}
              renderItem={renderChatItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
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
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  forwardButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#667eea',
  },
  disabledButton: {
    backgroundColor: '#E5E7EB',
  },
  forwardButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledText: {
    color: '#9CA3AF',
  },
  messagePreview: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  previewLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
    fontWeight: '500',
  },
  previewContent: {
    paddingLeft: 24,
  },
  previewText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 20,
  },
  mediaIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  mediaLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
    color: '#374151',
  },
  selectedCount: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#EEF2FF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  selectedCountText: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '600',
  },
  chatList: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  selectedChatItem: {
    backgroundColor: '#EEF2FF',
  },
  chatItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  chatAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  chatInfo: {
    flex: 1,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  groupLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  chatItemRight: {
    marginLeft: 12,
  },
  unselectedCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
  },
});

export default MessageForward;
