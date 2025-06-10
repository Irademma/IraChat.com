import React, { useEffect, useLayoutEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, FlatList, Animated, ActivityIndicator, Alert, Image, Dimensions, TextInput } from 'react-native';
import { db, mockChatList } from '../services/firebaseSimple';
import { collection, onSnapshot, query, orderBy, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useDispatch } from 'react-redux';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { setChats } from '../redux/chatSlice';
import { Chat } from '../types';
import { formatChatTime } from '../utils/dateUtils';
import EmptyState from '../components/EmptyState';

const { width } = Dimensions.get('window');

// New User Welcome Component for ChatsListScreen
interface NewUserWelcomeProps {
  onStartMessaging: () => void;
}

const NewUserWelcome: React.FC<NewUserWelcomeProps> = ({ onStartMessaging }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const iconPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // No animations - set values directly
    fadeAnim.setValue(1);
    scaleAnim.setValue(1);
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
            backgroundColor: 'rgba(102, 126, 234, 0.1)',
            borderWidth: 2,
            borderColor: 'rgba(102, 126, 234, 0.2)',
          }}
        >
          <View
            className="w-24 h-24 rounded-full items-center justify-center"
            style={{
              backgroundColor: 'rgba(102, 126, 234, 0.15)',
            }}
          >
            <Ionicons name="chatbubbles" size={48} color="#667eea" />
          </View>
        </View>

        {/* Floating message bubbles */}
        <View className="absolute -top-2 -right-2">
          <View
            className="w-6 h-6 rounded-full items-center justify-center"
            style={{ backgroundColor: '#10B981' }}
          >
            <Ionicons name="heart" size={12} color="white" />
          </View>
        </View>
        <View className="absolute -bottom-2 -left-2">
          <View
            className="w-6 h-6 rounded-full items-center justify-center"
            style={{ backgroundColor: '#F59E0B' }}
          >
            <Ionicons name="star" size={12} color="white" />
          </View>
        </View>
      </Animated.View>

      {/* Welcome Text */}
      <Text
        className="text-2xl text-gray-800 text-center mb-3"
        style={{ fontWeight: '700' }}
      >
        Start messaging with your people
      </Text>

      <Text className="text-gray-500 text-center text-base leading-6 mb-8">
        Connect with friends and family who are already on IraChat.
        Tap below to see your contacts and start your first conversation.
      </Text>

      {/* Action Button */}
      <TouchableOpacity
        onPress={onStartMessaging}
        className="px-8 py-4 rounded-full items-center justify-center"
        style={{
          backgroundColor: '#667eea',
          elevation: 8,
          shadowColor: '#667eea',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
        }}
        activeOpacity={0.8}
      >
        <View className="flex-row items-center">
          <Ionicons name="people" size={20} color="white" style={{ marginRight: 8 }} />
          <Text
            className="text-white text-base"
            style={{ fontWeight: '600' }}
          >
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

export default function ChatsListScreen({ navigation }: any) {
  const router = useRouter();
  const [chats, setLocalChats] = useState<Chat[]>([]);
  const [filteredChats, setFilteredChats] = useState<Chat[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [fabOpen, setFabOpen] = useState(false);
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const nav = useNavigation();
  const dispatch = useDispatch();

  // Animation for floating action buttons
  const mainFabScale = useRef(new Animated.Value(1)).current;
  const mainFabRotation = useRef(new Animated.Value(0)).current;
  const contactFabScale = useRef(new Animated.Value(0)).current;
  const groupFabScale = useRef(new Animated.Value(0)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const contactFabTranslateY = useRef(new Animated.Value(60)).current;
  const groupFabTranslateY = useRef(new Animated.Value(60)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;



  useLayoutEffect(() => {
    nav.setOptions({
      headerRight: () => null
    });
  }, [nav]);

  // Enhanced animation functions
  const toggleFab = () => {
    const toValue = fabOpen ? 0 : 1;
    const rotationValue = fabOpen ? 0 : 1;
    const translateValue = fabOpen ? 60 : 0;

    setFabOpen(!fabOpen);

    // No animations - set values directly
    mainFabRotation.setValue(rotationValue);
    contactFabScale.setValue(toValue);
    contactFabTranslateY.setValue(translateValue);
    groupFabScale.setValue(toValue);
    groupFabTranslateY.setValue(translateValue);
    overlayOpacity.setValue(toValue);
  };

  const animatePress = (animValue: Animated.Value) => {
    // No animation
    animValue.setValue(1);
  };

  // Auto-close FAB after 3 seconds of inactivity
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (fabOpen) {
      timeout = setTimeout(() => {
        toggleFab();
      }, 3000);
    }
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [fabOpen]);

  // Subtle pulse animation for main FAB
  useEffect(() => {
    const startPulse = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    if (!fabOpen) {
      startPulse();
    }
  }, [fabOpen]);

  // FAB action handlers
  const handleSelectContact = () => {
    animatePress(contactFabScale);
    toggleFab();
    setTimeout(() => {
      router.push('/contacts');
    }, 200);
  };

  const handleCreateGroup = () => {
    animatePress(groupFabScale);
    toggleFab();
    setTimeout(() => {
      navigation.navigate('CreateGroup');
    }, 200);
  };

  const handleMainFabPress = () => {
    animatePress(mainFabScale);
    toggleFab();
  };

  // Function to clear all chats from Firebase (DEVELOPMENT ONLY)
  const clearAllChats = async () => {
    try {
      console.log('🗑️ [ChatsListScreen] Clearing all chats for testing...');
      Alert.alert(
        '🚨 CLEAR ALL CHATS',
        'This will DELETE ALL chats in the Firebase database!\n\nThis is for development/testing only.\n\nAre you absolutely sure?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'DELETE ALL',
            style: 'destructive',
            onPress: async () => {
              try {
                console.log('🔥 [ChatsListScreen] Starting Firebase chat deletion...');

                // Get all chats
                const chatsQuery = query(collection(db, 'chats'));
                const chatsSnapshot = await getDocs(chatsQuery);

                console.log(`📊 [ChatsListScreen] Found ${chatsSnapshot.docs.length} chats to delete`);

                // Delete each chat document
                const deletePromises = chatsSnapshot.docs.map(async (chatDoc) => {
                  console.log(`🗑️ [ChatsListScreen] Deleting chat: ${chatDoc.id} (${chatDoc.data().name})`);
                  await deleteDoc(doc(db, 'chats', chatDoc.id));
                });

                await Promise.all(deletePromises);

                console.log('✅ [ChatsListScreen] All chats deleted successfully!');
                Alert.alert('Success', `Deleted ${chatsSnapshot.docs.length} chats from Firebase!`);

                // Refresh the chat list
                setLocalChats([]);

              } catch (error) {
                console.error('❌ [ChatsListScreen] Error deleting chats:', error);
                Alert.alert('Error', `Failed to delete chats: ${error instanceof Error ? error.message : 'Unknown error'}`);
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('❌ [ChatsListScreen] Error in clearAllChats:', error);
    }
  };

  useEffect(() => {
    // Load mock chat data for demonstration
    const loadMockChats = () => {
      console.log('📥 [ChatsListScreen] Loading mock chat data...');

      // Simulate loading delay for realistic experience
      setTimeout(() => {
        setLocalChats(mockChatList as any);
        setFilteredChats(mockChatList as any);
        dispatch(setChats(mockChatList as any));
        setIsLoadingChats(false);
        setHasLoadedOnce(true);

        console.log('✅ [ChatsListScreen] Mock chats loaded:', mockChatList.length);
      }, 1000);
    };

    loadMockChats();
  }, [dispatch]);

  // Search functionality
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredChats(chats);
    } else {
      const filtered = chats.filter(chat =>
        chat.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chat.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredChats(filtered);
    }
  }, [searchQuery, chats]);

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days === 1) return 'yesterday';
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString();
  };

  const getMessagePreview = (item: any) => {
    switch (item.messageType) {
      case 'image': return '📸 Photo';
      case 'video': return '🎥 Video';
      case 'audio': return '🎵 Audio message';
      case 'document': return '📄 Document';
      default: return item.lastMessage;
    }
  };

  const renderItem = ({ item, index }: { item: any; index: number }) => {
    return (
      <Animated.View
        style={{
          opacity: 1,
          transform: [{
            translateY: 0,
          }],
        }}
      >
        <TouchableOpacity
          onPress={() => {
            if (item.isGroup) {
              // Navigate to group chat
              console.log('Opening group chat:', item.name);
            } else {
              // Navigate to individual chat
              router.push({
                pathname: '/individual-chat',
                params: {
                  contactId: item.id,
                  contactName: item.name,
                  contactAvatar: item.avatar,
                  contactIsOnline: item.isOnline.toString(),
                  contactLastSeen: item.lastSeen?.getTime().toString() || ''
                }
              });
            }
          }}
          className="flex-row items-center px-4 py-3 bg-white"
          activeOpacity={0.7}
          style={{
            borderBottomWidth: 1,
            borderBottomColor: '#f3f4f6',
          }}
        >
          {/* Avatar with online indicator */}
          <View className="relative mr-3">
            <Image
              source={{ uri: item.avatar }}
              className="w-14 h-14 rounded-full"
              style={{ backgroundColor: '#f3f4f6' }}
            />

            {/* Online indicator */}
            {item.isOnline && (
              <View className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
            )}

            {/* Group indicator */}
            {item.isGroup && (
              <View className="absolute -top-1 -right-1 w-5 h-5 bg-sky-500 rounded-full items-center justify-center">
                <Ionicons name="people" size={10} color="white" />
              </View>
            )}
          </View>

          {/* Chat content */}
          <View className="flex-1 mr-3">
            <View className="flex-row items-center justify-between mb-1">
              <Text
                className="text-gray-900 text-base font-semibold flex-1"
                numberOfLines={1}
              >
                {item.name}
              </Text>

              {/* Typing indicator */}
              {item.isTyping && (
                <View className="flex-row items-center ml-2">
                  <Text className="text-sky-500 text-xs">
                    ✍️
                  </Text>
                </View>
              )}
            </View>

            <View className="flex-row items-center">
              <Text
                className={`flex-1 text-sm ${item.unreadCount > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'}`}
                numberOfLines={1}
              >
                {getMessagePreview(item)}
              </Text>
            </View>
          </View>

          {/* Right side - time and unread */}
          <View className="items-end justify-between h-14">
            <Text className="text-gray-400 text-xs">
              {formatTime(item.lastMessageTime)}
            </Text>

            <View className="flex-1 justify-end">
              {item.unreadCount > 0 && (
                <View className="bg-sky-500 rounded-full min-w-[20px] h-5 items-center justify-center px-1.5">
                  <Text className="text-white text-xs font-bold">
                    {item.unreadCount > 99 ? '99+' : item.unreadCount}
                  </Text>
                </View>
              )}

              {item.unreadCount === 0 && !item.isTyping && (
                <View className="flex-row items-center">
                  {item.messageType === 'audio' && (
                    <MaterialIcons name="mic" size={12} color="#9ca3af" />
                  )}
                  {item.messageType === 'image' && (
                    <MaterialIcons name="photo" size={12} color="#9ca3af" />
                  )}
                  {item.messageType === 'document' && (
                    <MaterialIcons name="description" size={12} color="#9ca3af" />
                  )}
                </View>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };



  return (
    <View className="flex-1 bg-white">
      {isLoadingChats ? (
        // Show loading state while fetching chats
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#667eea" />
          <Text className="text-gray-500 mt-2">Loading your chats...</Text>
        </View>
      ) : chats.length === 0 ? (
        // Only show NewUserWelcome when we've confirmed there are no chats
        <NewUserWelcome onStartMessaging={() => router.push('/contacts')} />
      ) : (
        <View className="flex-1">
          {/* Search Bar */}
          <View className="px-4 py-3 bg-white border-b border-gray-200">
            <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-2">
              <Ionicons name="search" size={20} color="#6b7280" />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search chats..."
                className="flex-1 ml-3 text-base"
                placeholderTextColor="#9ca3af"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color="#6b7280" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Chat list header */}
          <View className="px-4 py-2 bg-gray-50 border-b border-gray-200">
            <Text className="text-gray-600 text-sm font-medium">
              {searchQuery ? `SEARCH RESULTS (${filteredChats.length})` : `RECENT CHATS (${chats.length})`}
            </Text>
          </View>

          <FlatList
            data={filteredChats}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
            style={{ backgroundColor: '#ffffff' }}
            bounces={false}
            overScrollMode="never"
            scrollEventThrottle={16}
            ListEmptyComponent={() => (
              <View className="flex-1 items-center justify-center py-20">
                <Ionicons name="search-outline" size={64} color="#d1d5db" />
                <Text className="text-gray-500 text-lg font-medium mt-4">
                  No chats found
                </Text>
                <Text className="text-gray-400 text-center mt-2">
                  Try searching with a different term
                </Text>
              </View>
            )}
          />
        </View>
      )}

      {/* Overlay for FAB menu */}
      {fabOpen && (
        <Animated.View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            opacity: overlayOpacity,
          }}
        >
          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={toggleFab}
            activeOpacity={1}
          />
        </Animated.View>
      )}

      {/* Enhanced Multi-FAB System */}
      <View style={{ position: 'absolute', bottom: 32, right: 24 }}>

        {/* Contact Selection FAB */}
        <Animated.View
          style={{
            position: 'absolute',
            bottom: 140,
            right: 0,
            transform: [
              { scale: contactFabScale },
              { translateY: contactFabTranslateY }
            ],
            opacity: contactFabScale,
          }}
        >
          <TouchableOpacity
            onPress={handleSelectContact}
            className="w-14 h-14 rounded-full items-center justify-center"
            activeOpacity={0.8}
            style={{
              backgroundColor: '#10B981', // Green for contacts
              elevation: 10,
              shadowColor: '#10B981',
              shadowOffset: { width: 0, height: 5 },
              shadowOpacity: 0.4,
              shadowRadius: 10,
            }}
          >
            {/* Inner glow effect */}
            <View
              className="absolute inset-0 rounded-full"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
              }}
            />

            <Ionicons name="person-add" size={22} color="white" style={{ opacity: 0.95 }} />

            {/* Subtle pulse ring */}
            <View
              className="absolute inset-0 rounded-full"
              style={{
                backgroundColor: 'transparent',
                borderWidth: 1.5,
                borderColor: 'rgba(16, 185, 129, 0.4)',
                transform: [{ scale: 1.15 }],
              }}
            />
          </TouchableOpacity>
        </Animated.View>

        {/* Group Creation FAB */}
        <Animated.View
          style={{
            position: 'absolute',
            bottom: 80,
            right: 0,
            transform: [
              { scale: groupFabScale },
              { translateY: groupFabTranslateY }
            ],
            opacity: groupFabScale,
          }}
        >
          <TouchableOpacity
            onPress={handleCreateGroup}
            className="w-14 h-14 rounded-full items-center justify-center"
            activeOpacity={0.8}
            style={{
              backgroundColor: '#F59E0B', // Orange for groups
              elevation: 10,
              shadowColor: '#F59E0B',
              shadowOffset: { width: 0, height: 5 },
              shadowOpacity: 0.4,
              shadowRadius: 10,
            }}
          >
            {/* Inner glow effect */}
            <View
              className="absolute inset-0 rounded-full"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
              }}
            />

            <Ionicons name="people" size={22} color="white" style={{ opacity: 0.95 }} />

            {/* Subtle pulse ring */}
            <View
              className="absolute inset-0 rounded-full"
              style={{
                backgroundColor: 'transparent',
                borderWidth: 1.5,
                borderColor: 'rgba(245, 158, 11, 0.4)',
                transform: [{ scale: 1.15 }],
              }}
            />
          </TouchableOpacity>
        </Animated.View>

        {/* Main FAB */}
        <Animated.View
          style={{
            transform: [
              { scale: Animated.multiply(mainFabScale, pulseAnim) },
              {
                rotate: mainFabRotation.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '45deg'],
                }),
              },
            ],
          }}
        >
          <TouchableOpacity
            onPress={handleMainFabPress}
            className="w-16 h-16 rounded-full items-center justify-center"
            style={{
              backgroundColor: '#667eea',
              elevation: 12,
              shadowColor: '#667eea',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.4,
              shadowRadius: 12,
            }}
          >
            {/* Gradient-like inner circle for depth */}
            <View
              className="absolute inset-0 rounded-full"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
              }}
            />

            {/* Main icon */}
            <Ionicons name="add" size={28} color="white" style={{ opacity: 0.95 }} />

            {/* Subtle highlight overlay */}
            <View
              className="absolute inset-0 rounded-full"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
              }}
            />
          </TouchableOpacity>

          {/* Outer glow ring */}
          <View
            className="absolute inset-0 rounded-full"
            style={{
              backgroundColor: 'transparent',
              borderWidth: 2,
              borderColor: 'rgba(102, 126, 234, 0.3)',
              transform: [{ scale: 1.2 }],
            }}
          />
        </Animated.View>
      </View>
    </View>
  );
}
