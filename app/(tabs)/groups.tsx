import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
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
  View
} from 'react-native';



interface Group {
  id: string;
  name: string;
  description?: string; // Add description property
  logo?: string;
  avatar?: string; // Add avatar property for compatibility
  memberCount: number;
  lastMessage: string;
  lastMessageTime?: string;
  lastMessageAt?: Date; // Add for compatibility
  lastMessageBy: string;
  usageFrequency: number; // Higher number = more frequently used
  isActive: boolean;
}

export default function GroupsScreen() {
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<Group[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  // Tab navigation with smooth animations
  // const { handleSwipeGesture } = useTabNavigation();

  // Animation for floating action button
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Sample groups for demonstration
  const mockGroups: Group[] = [
    {
      id: 'group_1',
      name: 'Family Group',
      description: 'Our lovely family chat',
      memberCount: 5,
      lastMessage: 'Dinner is ready!',
      lastMessageBy: 'Mom',
      lastMessageTime: '30m ago',
      lastMessageAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      logo: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=150',
      avatar: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=150',
      isActive: true,
      usageFrequency: 10
    },
    {
      id: 'group_2',
      name: 'Work Team',
      description: 'Project discussions and updates',
      memberCount: 8,
      lastMessage: 'Meeting at 3 PM',
      lastMessageBy: 'John',
      lastMessageTime: '1h ago',
      lastMessageAt: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
      logo: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150',
      avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150',
      isActive: true,
      usageFrequency: 8
    },
    {
      id: 'group_3',
      name: 'Friends Forever',
      description: 'Best friends group chat',
      memberCount: 6,
      lastMessage: 'Let\'s meet this weekend!',
      lastMessageBy: 'Sarah',
      lastMessageTime: '2h ago',
      lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      logo: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=150',
      avatar: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=150',
      isActive: true,
      usageFrequency: 7
    }
  ];

  useEffect(() => {
    loadGroups();
  }, []);

  useEffect(() => {
    filterGroups();
  }, [searchQuery, groups]);

  const loadGroups = () => {
    setIsLoading(true);
    // Sort groups by usage frequency (most used first)
    const sortedGroups = mockGroups.sort((a, b) => b.usageFrequency - a.usageFrequency);
    setGroups(sortedGroups);
    setIsLoading(false);
  };

  const filterGroups = () => {
    if (searchQuery.trim() === '') {
      setFilteredGroups(groups);
    } else {
      const filtered = groups.filter(group =>
        group.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredGroups(filtered);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      loadGroups();
      setRefreshing(false);
    }, 1000);
  };

  const handleGroupPress = (group: Group) => {
    try {
      // Navigate to group chat
      router.push(`/chat/${group.id}?name=${encodeURIComponent(group.name)}&isGroup=true`);
    } catch (error) {
      Alert.alert('Error', 'Failed to open group chat');
      console.error('Group navigation error:', error);
    }
  };

  // No animation effects
  const animatePress = () => {
    // No animation
    scaleAnim.setValue(1);
  };

  const startPulseAnimation = () => {
    // No animation
    pulseAnim.setValue(1);
  };

  useEffect(() => {
    // Start subtle pulse animation when component mounts
    startPulseAnimation();
  }, []);

  const handleCreateGroup = () => {
    animatePress();

    Alert.alert(
      'Create Group',
      'Would you like to create a new group?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Create',
          onPress: () => {
            try {
              router.push('/create-group');
            } catch (error) {
              Alert.alert('Error', 'Failed to open group creation');
              console.error('Create group navigation error:', error);
            }
          }
        }
      ]
    );
  };

  const renderGroupItem = ({ item }: { item: Group }) => (
    <TouchableOpacity
      onPress={() => handleGroupPress(item)}
      className="flex-row items-center px-4 py-3 border-b border-gray-100"
      activeOpacity={0.7}
    >
      {/* Group Logo */}
      <View className="relative">
        <Image
          source={{ uri: item.logo }}
          className="w-14 h-14 rounded-full"
          defaultSource={require('../../assets/images/LOGO.png')}
        />
        {item.isActive && (
          <View className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white" style={{ backgroundColor: '#667eea' }} />
        )}
      </View>

      {/* Group Info */}
      <View className="flex-1 ml-3">
        <View className="flex-row items-center justify-between mb-1">
          <Text
            className="text-gray-900 text-base"
            numberOfLines={1}
            style={{ fontWeight: '600' }}
          >
            {item.name}
          </Text>
          <Text className="text-gray-400 text-xs">
            {item.lastMessageTime}
          </Text>
        </View>

        <View className="flex-row items-center">
          <Text className="text-gray-600 text-sm flex-1" numberOfLines={1}>
            {searchQuery ? (
              <>
                <Text className="text-gray-500">{item.memberCount} members • </Text>
                {item.lastMessageBy}: {item.lastMessage}
              </>
            ) : (
              <>
                {item.lastMessageBy}: {item.lastMessage}
              </>
            )}
          </Text>
        </View>

        {/* Usage indicator */}
        <View className="flex-row items-center mt-1">
          <View className="flex-row">
            {[...Array(5)].map((_, index) => (
              <Ionicons
                key={index}
                name="ellipse"
                size={6}
                color={index < Math.floor(item.usageFrequency / 20) ? '#667eea' : '#E5E7EB'}
                style={{ marginRight: 2 }}
              />
            ))}
          </View>
          <Text className="text-xs text-gray-400 ml-2">
            {item.usageFrequency}% active
          </Text>
        </View>
      </View>

      {/* Unread indicator (if any) */}
      {item.isActive && (
        <View className="w-2 h-2 rounded-full ml-2" style={{ backgroundColor: '#667eea' }} />
      )}
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center px-8 py-16">
      <Ionicons name="people-outline" size={80} color="#9CA3AF" />
      <Text
        className="text-gray-500 text-lg mt-4 text-center"
        style={{ fontWeight: '500' }}
      >
        {searchQuery ? 'No groups found' : 'No groups yet'}
      </Text>
      <Text className="text-gray-400 text-sm text-center mt-2 leading-5">
        {searchQuery 
          ? `No groups match "${searchQuery}"`
          : 'Join or create groups to start chatting with multiple people'
        }
      </Text>
      {!searchQuery && (
        <TouchableOpacity
          onPress={handleCreateGroup}
          className="px-6 py-3 rounded-full mt-6"
          style={{ backgroundColor: '#667eea' }}
        >
          <Text
            className="text-white"
            style={{ fontWeight: '600' }}
          >
            Create Group
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View
      className="flex-1 bg-white"
      accessible={true}
      accessibilityLabel="Groups screen"
    >
      {/* Search Bar */}
      <View className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <View className="flex-row items-center bg-white rounded-full px-4 py-2 shadow-sm">
          <Ionicons
            name="search"
            size={20}
            color="#9CA3AF"
            accessible={true}
            accessibilityLabel="Search icon"
          />
          <TextInput
            placeholder="Search groups..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="flex-1 ml-3 text-gray-700"
            placeholderTextColor="#9CA3AF"
            accessible={true}
            accessibilityLabel="Search groups input"
            accessibilityHint="Type to search for groups"
            accessibilityRole="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
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

      {/* Groups List */}
      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#667eea" />
          <Text className="text-gray-500 mt-4">Loading groups...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredGroups}
          keyExtractor={(item) => item.id}
          renderItem={renderGroupItem}
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
        contentContainerStyle={filteredGroups.length === 0 ? { flex: 1 } : undefined}
        bounces={false}
        overScrollMode="never"
        scrollEventThrottle={16}
      />
      )}

      {/* Enhanced Animated Floating Action Button */}
      <Animated.View
        style={{
          position: 'absolute',
          bottom: 32,
          right: 24,
          transform: [
            { scale: 1 }
          ],
        }}
      >
        <TouchableOpacity
          onPress={handleCreateGroup}
          className="w-16 h-16 rounded-full items-center justify-center"
          activeOpacity={0.8}
          style={{
            backgroundColor: '#667eea',
            elevation: 12,
            shadowColor: '#667eea',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.4,
            shadowRadius: 12,
          }}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Create new group"
          accessibilityHint="Tap to create a new group chat"
        >
          {/* Gradient-like inner circle for depth */}
          <View
            className="absolute inset-0 rounded-full"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
            }}
          />

          {/* Main icon container */}
          <View className="items-center justify-center relative">
            {/* Primary group icon */}
            <Ionicons name="people" size={22} color="white" style={{ opacity: 0.95 }} />

            {/* Add indicator with better positioning */}
            <View
              className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full items-center justify-center"
              style={{ backgroundColor: '#4F46E5' }}
            >
              <Ionicons name="add" size={12} color="white" />
            </View>
          </View>

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

        {/* Optional: Small notification dot for visual appeal */}
        <View
          className="absolute -top-1 -right-1 w-4 h-4 rounded-full items-center justify-center"
          style={{
            backgroundColor: '#10B981', // Green accent
            borderWidth: 2,
            borderColor: 'white',
          }}
        >
          <Text className="text-white text-xs font-bold">+</Text>
        </View>
      </Animated.View>



    </View>
  );
}
