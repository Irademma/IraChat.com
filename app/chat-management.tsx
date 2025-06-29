import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import {
    Alert,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
    ActivityIndicator,
    Switch,
    Image,
    FlatList,
    Modal,
    TextInput,
} from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "../src/redux/store";
import { realChatService } from "../src/services/realChatService";

interface ChatItem {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  timestamp: Date;
  messageCount: number;
  mediaCount: number;
  isGroup: boolean;
  isSelected: boolean;
}

export default function ChatManagementScreen() {
  const router = useRouter();
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChats, setSelectedChats] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [showClearOptions, setShowClearOptions] = useState(false);
  const [clearingInProgress, setClearingInProgress] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<'all' | 'individual' | 'groups'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size'>('date');

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    setLoading(true);
    try {
      // Load all chats from the real chat service
      const result = await realChatService.getUserChats(currentUser?.id || '');
      if (result.success && result.chats) {
        const chatItems: ChatItem[] = result.chats.map(chat => ({
          id: chat.id,
          name: chat.isGroup ? chat.groupName || 'Group Chat' : chat.participantName || 'Unknown',
          avatar: chat.isGroup ? chat.groupAvatar : chat.participantAvatar,
          lastMessage: chat.lastMessage?.text || 'No messages',
          timestamp: chat.lastMessage?.timestamp?.toDate() || new Date(),
          messageCount: chat.messageCount || 0,
          mediaCount: chat.mediaCount || 0,
          isGroup: chat.isGroup || false,
          isSelected: false,
        }));
        setChats(chatItems);
      }
    } catch (error) {
      console.error('Error loading chats:', error);
      // Provide mock data for demonstration
      setChats([
        {
          id: '1',
          name: 'John Doe',
          avatar: undefined,
          lastMessage: 'Hey, how are you?',
          timestamp: new Date(),
          messageCount: 156,
          mediaCount: 23,
          isGroup: false,
          isSelected: false,
        },
        {
          id: '2',
          name: 'Family Group',
          avatar: undefined,
          lastMessage: 'See you tomorrow!',
          timestamp: new Date(Date.now() - 86400000),
          messageCount: 1247,
          mediaCount: 89,
          isGroup: true,
          isSelected: false,
        },
        {
          id: '3',
          name: 'Work Team',
          avatar: undefined,
          lastMessage: 'Meeting at 3 PM',
          timestamp: new Date(Date.now() - 172800000),
          messageCount: 567,
          mediaCount: 45,
          isGroup: true,
          isSelected: false,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const toggleChatSelection = (chatId: string) => {
    const newSelected = new Set(selectedChats);
    if (newSelected.has(chatId)) {
      newSelected.delete(chatId);
    } else {
      newSelected.add(chatId);
    }
    setSelectedChats(newSelected);
    setSelectAll(newSelected.size === chats.length);
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedChats(new Set());
    } else {
      setSelectedChats(new Set(chats.map(chat => chat.id)));
    }
    setSelectAll(!selectAll);
  };

  const handleClearSelected = () => {
    if (selectedChats.size === 0) {
      Alert.alert('No Selection', 'Please select chats to clear');
      return;
    }

    setShowClearOptions(true);
  };

  const executeClearOperation = async (operation: 'messages' | 'media' | 'all') => {
    setClearingInProgress(true);
    setShowClearOptions(false);

    try {
      const selectedChatIds = Array.from(selectedChats);
      let operationText = '';
      
      switch (operation) {
        case 'messages':
          operationText = 'messages only';
          break;
        case 'media':
          operationText = 'media files only';
          break;
        case 'all':
          operationText = 'all data';
          break;
      }

      // Simulate clearing operation
      await new Promise(resolve => setTimeout(resolve, 2000));

      // In a real implementation, you would call the appropriate service methods
      for (const chatId of selectedChatIds) {
        switch (operation) {
          case 'messages':
            // await realChatService.clearChatMessages(chatId);
            break;
          case 'media':
            // await realChatService.clearChatMedia(chatId);
            break;
          case 'all':
            // await realChatService.clearChatCompletely(chatId);
            break;
        }
      }

      Alert.alert(
        'Success',
        `Cleared ${operationText} from ${selectedChatIds.length} chat(s)`,
        [
          {
            text: 'OK',
            onPress: () => {
              setSelectedChats(new Set());
              setSelectAll(false);
              loadChats(); // Reload to reflect changes
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error clearing chats:', error);
      Alert.alert('Error', 'Failed to clear selected chats');
    } finally {
      setClearingInProgress(false);
    }
  };

  const getFilteredAndSortedChats = () => {
    let filteredChats = chats;

    // Apply search filter
    if (searchQuery.trim()) {
      filteredChats = filteredChats.filter(chat =>
        chat.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply type filter
    if (filterType !== 'all') {
      filteredChats = filteredChats.filter(chat =>
        filterType === 'groups' ? chat.isGroup : !chat.isGroup
      );
    }

    // Apply sorting
    filteredChats.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'date':
          return b.timestamp.getTime() - a.timestamp.getTime();
        case 'size':
          return (b.messageCount + b.mediaCount) - (a.messageCount + a.mediaCount);
        default:
          return 0;
      }
    });

    return filteredChats;
  };

  const renderChatItem = ({ item }: { item: ChatItem }) => (
    <TouchableOpacity
      onPress={() => toggleChatSelection(item.id)}
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
        borderWidth: selectedChats.has(item.id) ? 2 : 0,
        borderColor: selectedChats.has(item.id) ? '#87CEEB' : 'transparent',
      }}
    >
      {/* Selection Checkbox */}
      <View style={{
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: selectedChats.has(item.id) ? '#87CEEB' : '#ddd',
        backgroundColor: selectedChats.has(item.id) ? '#87CEEB' : 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
      }}>
        {selectedChats.has(item.id) && (
          <Ionicons name="checkmark" size={16} color="#FFFFFF" />
        )}
      </View>

      {/* Avatar */}
      <View style={{ marginRight: 12 }}>
        {item.avatar ? (
          <Image
            source={{ uri: item.avatar }}
            style={{ width: 48, height: 48, borderRadius: 24 }}
          />
        ) : (
          <View style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: '#87CEEB',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <Ionicons 
              name={item.isGroup ? "people" : "person"} 
              size={24} 
              color="#FFFFFF" 
            />
          </View>
        )}
      </View>

      {/* Chat Info */}
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <Text style={{
            fontSize: 16,
            fontWeight: '600',
            color: '#333',
            flex: 1,
          }}>
            {item.name}
          </Text>
          {item.isGroup && (
            <View style={{
              backgroundColor: '#87CEEB',
              paddingHorizontal: 8,
              paddingVertical: 2,
              borderRadius: 10,
              marginLeft: 8,
            }}>
              <Text style={{ color: 'white', fontSize: 10, fontWeight: '600' }}>
                GROUP
              </Text>
            </View>
          )}
        </View>
        
        <Text style={{
          fontSize: 14,
          color: '#666',
          marginBottom: 4,
        }} numberOfLines={1}>
          {item.lastMessage}
        </Text>
        
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 12, color: '#999' }}>
            {item.timestamp.toLocaleDateString()}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 12, color: '#87CEEB', marginRight: 8 }}>
              {item.messageCount} msgs
            </Text>
            <Text style={{ fontSize: 12, color: '#87CEEB' }}>
              {item.mediaCount} media
            </Text>
          </View>
        </View>
      </View>
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
          Loading chats...
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
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
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
            flex: 1,
          }}>
            Chat Management
          </Text>

          <TouchableOpacity
            onPress={toggleSelectAll}
            style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 16,
            }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '600' }}>
              {selectAll ? 'Deselect All' : 'Select All'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 12,
          paddingHorizontal: 16,
          paddingVertical: 12,
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 12,
        }}>
          <Ionicons name="search" size={20} color="#87CEEB" />
          <TextInput
            placeholder="Search chats..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{
              flex: 1,
              marginLeft: 12,
              fontSize: 16,
              color: '#333',
            }}
            placeholderTextColor="#999"
          />
        </View>

        {/* Filter and Sort Options */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row' }}>
            {(['all', 'individual', 'groups'] as const).map((type) => (
              <TouchableOpacity
                key={type}
                onPress={() => setFilterType(type)}
                style={{
                  backgroundColor: filterType === type ? '#FFFFFF' : 'rgba(255,255,255,0.2)',
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 16,
                  marginRight: 8,
                }}
              >
                <Text style={{
                  color: filterType === type ? '#87CEEB' : '#FFFFFF',
                  fontSize: 12,
                  fontWeight: '600',
                  textTransform: 'capitalize',
                }}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            onPress={() => {
              const sortOptions: Array<typeof sortBy> = ['date', 'name', 'size'];
              const currentIndex = sortOptions.indexOf(sortBy);
              const nextIndex = (currentIndex + 1) % sortOptions.length;
              setSortBy(sortOptions[nextIndex]);
            }}
            style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 16,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <Ionicons name="swap-vertical" size={16} color="#FFFFFF" />
            <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '600', marginLeft: 4, textTransform: 'capitalize' }}>
              {sortBy}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Chat List */}
      <FlatList
        data={getFilteredAndSortedChats()}
        renderItem={renderChatItem}
        keyExtractor={(item) => item.id}
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={{
            alignItems: 'center',
            marginTop: 50,
          }}>
            <Ionicons name="chatbubbles" size={64} color="#87CEEB" />
            <Text style={{
              fontSize: 18,
              fontWeight: '600',
              color: '#333',
              marginTop: 16,
              textAlign: 'center',
            }}>
              No chats found
            </Text>
            <Text style={{
              fontSize: 14,
              color: '#666',
              marginTop: 8,
              textAlign: 'center',
            }}>
              Try adjusting your search or filter criteria
            </Text>
          </View>
        )}
      />

      {/* Action Button */}
      {selectedChats.size > 0 && (
        <View style={{
          backgroundColor: '#FFFFFF',
          padding: 20,
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
        }}>
          <TouchableOpacity
            onPress={handleClearSelected}
            disabled={clearingInProgress}
            style={{
              backgroundColor: '#DC3545',
              padding: 16,
              borderRadius: 12,
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {clearingInProgress ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Ionicons name="trash" size={20} color="#FFFFFF" />
                <Text style={{
                  color: '#FFFFFF',
                  fontSize: 16,
                  fontWeight: '600',
                  marginLeft: 8,
                }}>
                  Clear {selectedChats.size} Chat{selectedChats.size > 1 ? 's' : ''}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Clear Options Modal */}
      <Modal
        visible={showClearOptions}
        transparent
        animationType="slide"
        onRequestClose={() => setShowClearOptions(false)}
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
              Clear Chat Data
            </Text>

            <Text style={{
              fontSize: 16,
              color: "#666",
              textAlign: "center",
              marginBottom: 20,
            }}>
              What would you like to clear from the selected {selectedChats.size} chat{selectedChats.size > 1 ? 's' : ''}?
            </Text>

            <TouchableOpacity
              onPress={() => {
                Alert.alert(
                  'Clear Messages Only',
                  'This will delete all messages but keep media files. Continue?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Clear Messages', style: 'destructive', onPress: () => executeClearOperation('messages') }
                  ]
                );
              }}
              style={{
                backgroundColor: '#F59E0B',
                padding: 16,
                borderRadius: 12,
                marginBottom: 12,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="chatbubble" size={20} color="#FFFFFF" />
              <Text style={{
                color: '#FFFFFF',
                fontSize: 16,
                fontWeight: '600',
                marginLeft: 8,
              }}>
                Clear Messages Only
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                Alert.alert(
                  'Clear Media Only',
                  'This will delete all media files but keep text messages. Continue?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Clear Media', style: 'destructive', onPress: () => executeClearOperation('media') }
                  ]
                );
              }}
              style={{
                backgroundColor: '#10B981',
                padding: 16,
                borderRadius: 12,
                marginBottom: 12,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="images" size={20} color="#FFFFFF" />
              <Text style={{
                color: '#FFFFFF',
                fontSize: 16,
                fontWeight: '600',
                marginLeft: 8,
              }}>
                Clear Media Only
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                Alert.alert(
                  'Clear Everything',
                  'This will permanently delete ALL messages and media from the selected chats. This action cannot be undone. Continue?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Clear Everything', style: 'destructive', onPress: () => executeClearOperation('all') }
                  ]
                );
              }}
              style={{
                backgroundColor: '#DC3545',
                padding: 16,
                borderRadius: 12,
                marginBottom: 20,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="trash" size={20} color="#FFFFFF" />
              <Text style={{
                color: '#FFFFFF',
                fontSize: 16,
                fontWeight: '600',
                marginLeft: 8,
              }}>
                Clear Everything
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowClearOptions(false)}
              style={{
                backgroundColor: '#f0f0f0',
                padding: 16,
                borderRadius: 12,
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
          </View>
        </View>
      </Modal>
    </View>
  );
}
