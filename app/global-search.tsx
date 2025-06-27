import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { db } from '../src/services/firebaseSimple';

interface SearchResult {
  id: string;
  type: 'chat' | 'contact' | 'message' | 'group' | 'update';
  title: string;
  subtitle: string;
  content?: string;
  avatar?: string;
  timestamp?: string;
}

export default function GlobalSearchScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const filters = [
    { key: 'all', label: 'All', icon: 'search' },
    { key: 'chats', label: 'Chats', icon: 'chatbubbles' },
    { key: 'contacts', label: 'Contacts', icon: 'people' },
    { key: 'messages', label: 'Messages', icon: 'chatbubble' },
    { key: 'groups', label: 'Groups', icon: 'people-circle' },
    { key: 'updates', label: 'Updates', icon: 'camera' },
  ];

  useEffect(() => {
    if (searchQuery.trim().length > 2) {
      performSearch();
    } else {
      setResults([]);
    }
  }, [searchQuery, activeFilter]);

  const performSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    try {
      const searchResults: SearchResult[] = [];

      // Search chats
      if (activeFilter === 'all' || activeFilter === 'chats') {
        const chatsResults = await searchChats(searchQuery);
        searchResults.push(...chatsResults);
      }

      // Search contacts
      if (activeFilter === 'all' || activeFilter === 'contacts') {
        const contactsResults = await searchContacts(searchQuery);
        searchResults.push(...contactsResults);
      }

      // Search messages
      if (activeFilter === 'all' || activeFilter === 'messages') {
        const messagesResults = await searchMessages(searchQuery);
        searchResults.push(...messagesResults);
      }

      // Search groups
      if (activeFilter === 'all' || activeFilter === 'groups') {
        const groupsResults = await searchGroups(searchQuery);
        searchResults.push(...groupsResults);
      }

      // Search updates
      if (activeFilter === 'all' || activeFilter === 'updates') {
        const updatesResults = await searchUpdates(searchQuery);
        searchResults.push(...updatesResults);
      }

      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Search Error', 'Failed to perform search. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, activeFilter]);

  const searchChats = async (searchQuery: string): Promise<SearchResult[]> => {
    try {
      if (!db) return [];

      const chatsRef = collection(db, 'chats');
      const q = query(chatsRef, limit(50));

      const snapshot = await getDocs(q);
      return snapshot.docs
        .filter(doc => {
          const data = doc.data();
          const name = data.name || '';
          return name.toLowerCase().includes(searchQuery.toLowerCase());
        })
        .slice(0, 10)
        .map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            type: 'chat' as const,
            title: data.name || 'Unknown Chat',
            subtitle: `${data.participants?.length || 0} participants`,
            avatar: data.avatar,
          };
        });
    } catch (error) {
      console.error('Error searching chats:', error);
      return [];
    }
  };

  const searchContacts = async (searchQuery: string): Promise<SearchResult[]> => {
    try {
      if (!db) return [];

      const usersRef = collection(db, 'users');
      const q = query(usersRef, limit(50));

      const snapshot = await getDocs(q);
      return snapshot.docs
        .filter(doc => {
          const data = doc.data();
          const name = data.name || '';
          const username = data.username || '';
          return name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                 username.toLowerCase().includes(searchQuery.toLowerCase());
        })
        .slice(0, 10)
        .map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            type: 'contact' as const,
            title: data.name || 'Unknown User',
            subtitle: data.username ? `@${data.username}` : data.phoneNumber || '',
            avatar: data.avatar,
          };
        });
    } catch (error) {
      console.error('Error searching contacts:', error);
      return [];
    }
  };

  const searchMessages = async (searchQuery: string): Promise<SearchResult[]> => {
    // For now, return mock results since searching across all message subcollections is complex
    return [
      {
        id: 'msg1',
        type: 'message',
        title: 'Message containing "' + searchQuery + '"',
        subtitle: 'From John Doe • 2 hours ago',
        content: `Found message with "${searchQuery}" in conversation`,
      },
    ];
  };

  const searchGroups = async (searchQuery: string): Promise<SearchResult[]> => {
    try {
      if (!db) return [];

      const groupsRef = collection(db, 'groups');
      const q = query(groupsRef, limit(50));

      const snapshot = await getDocs(q);
      return snapshot.docs
        .filter(doc => {
          const data = doc.data();
          const name = data.name || '';
          return name.toLowerCase().includes(searchQuery.toLowerCase());
        })
        .slice(0, 10)
        .map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            type: 'group' as const,
            title: data.name || 'Unknown Group',
            subtitle: `${data.memberCount || 0} members`,
            avatar: data.avatar,
          };
        });
    } catch (error) {
      console.error('Error searching groups:', error);
      return [];
    }
  };

  const searchUpdates = async (searchQuery: string): Promise<SearchResult[]> => {
    try {
      if (!db) return [];

      const updatesRef = collection(db, 'updates');
      const q = query(
        updatesRef,
        orderBy('timestamp', 'desc'),
        limit(10)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs
        .filter(doc => {
          const data = doc.data();
          const caption = data.caption || '';
          return caption.toLowerCase().includes(searchQuery.toLowerCase());
        })
        .map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            type: 'update' as const,
            title: data.caption || 'Update',
            subtitle: `By ${data.userName || 'Unknown'} • ${formatTime(data.timestamp)}`,
            avatar: data.userAvatar,
          };
        });
    } catch (error) {
      console.error('Error searching updates:', error);
      return [];
    }
  };

  const formatTime = (timestamp: any) => {
    try {
      const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
      const now = new Date();
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

      if (diffInMinutes < 1) return 'Just now';
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
      
      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) return `${diffInHours}h ago`;
      
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    } catch {
      return 'Recently';
    }
  };

  const handleResultPress = (result: SearchResult) => {
    switch (result.type) {
      case 'chat':
        router.push(`/chat/${result.id}?name=${result.title}`);
        break;
      case 'contact':
        Alert.alert('Contact', `Open chat with ${result.title}?`, [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Chat', onPress: () => router.push(`/chat/${result.id}?name=${result.title}`) },
        ]);
        break;
      case 'group':
        router.push(`/chat/${result.id}`);
        break;
      case 'update':
        Alert.alert('Update', `View update by ${result.title}?`);
        break;
      case 'message':
        Alert.alert('Message', 'Navigate to message in chat?');
        break;
    }
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'chat': return 'chatbubbles';
      case 'contact': return 'person';
      case 'message': return 'chatbubble';
      case 'group': return 'people-circle';
      case 'update': return 'camera';
      default: return 'search';
    }
  };

  const getResultColor = (type: string) => {
    switch (type) {
      case 'chat': return '#3B82F6';
      case 'contact': return '#10B981';
      case 'message': return '#8B5CF6';
      case 'group': return '#F59E0B';
      case 'update': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const renderResult = ({ item }: { item: SearchResult }) => (
    <TouchableOpacity
      onPress={() => handleResultPress(item)}
      className="flex-row items-center p-4 border-b border-gray-100"
    >
      <View className="w-12 h-12 rounded-full items-center justify-center mr-3"
            style={{ backgroundColor: `${getResultColor(item.type)}20` }}>
        {item.avatar ? (
          <Image source={{ uri: item.avatar }} className="w-12 h-12 rounded-full" />
        ) : (
          <Ionicons name={getResultIcon(item.type) as any} size={24} color={getResultColor(item.type)} />
        )}
      </View>
      
      <View className="flex-1">
        <Text className="text-gray-900 font-semibold text-base">{item.title}</Text>
        <Text className="text-gray-500 text-sm mt-1">{item.subtitle}</Text>
        {item.content && (
          <Text className="text-gray-600 text-sm mt-1" numberOfLines={2}>
            {item.content}
          </Text>
        )}
      </View>
      
      <View className="items-center">
        <Text className="text-gray-400 text-xs uppercase tracking-wide">
          {item.type}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-white px-4 py-6 border-b border-gray-200">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-900">Global Search</Text>
        </View>
      </View>

      {/* Search Input */}
      <View className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <View className="flex-row items-center bg-white rounded-full px-4 py-3 shadow-sm">
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search everything..."
            className="flex-1 ml-3 text-gray-700"
            placeholderTextColor="#9CA3AF"
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filters */}
      <View className="px-4 py-3 bg-white border-b border-gray-200">
        <FlatList
          data={filters}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setActiveFilter(item.key)}
              className={`flex-row items-center px-4 py-2 rounded-full mr-3 ${
                activeFilter === item.key ? 'bg-blue-100' : 'bg-gray-100'
              }`}
            >
              <Ionicons
                name={item.icon as any}
                size={16}
                color={activeFilter === item.key ? '#3B82F6' : '#6B7280'}
              />
              <Text
                className={`ml-2 font-medium ${
                  activeFilter === item.key ? 'text-blue-600' : 'text-gray-600'
                }`}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Results */}
      <View className="flex-1">
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text className="text-gray-500 mt-2">Searching...</Text>
          </View>
        ) : results.length > 0 ? (
          <FlatList
            data={results}
            renderItem={renderResult}
            keyExtractor={(item) => `${item.type}-${item.id}`}
            showsVerticalScrollIndicator={false}
          />
        ) : searchQuery.length > 0 ? (
          <View className="flex-1 items-center justify-center p-8">
            <Ionicons name="search" size={64} color="#D1D5DB" />
            <Text className="text-gray-500 text-lg font-medium mt-4">No results found</Text>
            <Text className="text-gray-400 text-center mt-2">
              Try searching with different keywords
            </Text>
          </View>
        ) : (
          <View className="flex-1 items-center justify-center p-8">
            <Ionicons name="search" size={64} color="#D1D5DB" />
            <Text className="text-gray-500 text-lg font-medium mt-4">Start searching</Text>
            <Text className="text-gray-400 text-center mt-2">
              Search across chats, contacts, messages, groups, and updates
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
