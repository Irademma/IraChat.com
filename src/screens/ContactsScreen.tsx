import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  Animated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const mockContacts = [
  {
    id: 'contact1',
    name: 'Emma Johnson',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
    isOnline: false,
    lastSeen: new Date(Date.now() - 5 * 60 * 1000),
    hasIraChat: true
  },
  {
    id: 'contact2',
    name: 'Alex Chen',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    isOnline: true,
    lastSeen: null,
    hasIraChat: true
  },
  {
    id: 'contact3',
    name: 'Sarah Williams',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    isOnline: true,
    lastSeen: null,
    hasIraChat: true
  },
  {
    id: 'contact4',
    name: 'Michael Brown',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    isOnline: false,
    lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000),
    hasIraChat: true
  },
  {
    id: 'contact5',
    name: 'Lisa Davis',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face',
    isOnline: false,
    lastSeen: new Date(Date.now() - 30 * 60 * 1000),
    hasIraChat: true
  },
  {
    id: 'contact6',
    name: 'David Wilson',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
    isOnline: true,
    lastSeen: null,
    hasIraChat: true
  },
  {
    id: 'contact7',
    name: 'Jennifer Garcia',
    avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop&crop=face',
    isOnline: false,
    lastSeen: new Date(Date.now() - 1 * 60 * 60 * 1000),
    hasIraChat: true
  },
  {
    id: 'contact8',
    name: 'Robert Martinez',
    avatar: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=100&h=100&fit=crop&crop=face',
    isOnline: true,
    lastSeen: null,
    hasIraChat: true
  }
];

const ContactsScreen = () => {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [filteredContacts, setFilteredContacts] = useState(mockContacts);

  const formatLastSeen = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const handleSearch = (text: string) => {
    setSearchText(text);
    if (text.trim() === '') {
      setFilteredContacts(mockContacts);
    } else {
      const filtered = mockContacts.filter(contact =>
        contact.name.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredContacts(filtered);
    }
  };

  const openChat = (contact: any) => {
    router.push({
      pathname: '/individual-chat',
      params: {
        contactId: contact.id,
        contactName: contact.name,
        contactAvatar: contact.avatar,
        contactIsOnline: contact.isOnline.toString(),
        contactLastSeen: contact.lastSeen?.getTime().toString() || ''
      }
    });
  };

  const renderContact = (contact: any, index: number) => {
    return (
      <TouchableOpacity
        key={contact.id}
        onPress={() => openChat(contact)}
        className="flex-row items-center px-4 py-3 border-b border-gray-100"
        activeOpacity={0.7}
      >
        <View className="relative">
          <Image
            source={{ uri: contact.avatar }}
            className="w-12 h-12 rounded-full"
          />
          {contact.isOnline && (
            <View className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
          )}
        </View>
        
        <View className="flex-1 ml-3">
          <Text className="text-gray-900 font-semibold text-base">
            {contact.name}
          </Text>
          <View className="flex-row items-center mt-1">
            {contact.isOnline ? (
              <Text className="text-green-600 text-sm font-medium">Online</Text>
            ) : (
              <Text className="text-gray-500 text-sm">
                Last seen {formatLastSeen(contact.lastSeen)}
              </Text>
            )}
          </View>
        </View>
        
        <View className="items-center">
          <View className="bg-sky-100 rounded-full p-2">
            <Ionicons name="chatbubble" size={16} color="#0ea5e9" />
          </View>
          <Text className="text-xs text-sky-600 mt-1 font-medium">IraChat</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 bg-sky-500 shadow-sm">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        
        <View className="flex-1">
          <Text className="text-white font-semibold text-lg">Select Contact</Text>
          <Text className="text-white/80 text-sm">
            {filteredContacts.length} IraChat users
          </Text>
        </View>
      </View>

      {/* Search Bar */}
      <View className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <View className="flex-row items-center bg-white rounded-full px-4 py-2 border border-gray-200">
          <Ionicons name="search" size={20} color="#6b7280" />
          <TextInput
            value={searchText}
            onChangeText={handleSearch}
            placeholder="Search contacts..."
            className="flex-1 ml-3 text-base"
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Ionicons name="close-circle" size={20} color="#6b7280" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Contacts List */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {filteredContacts.length > 0 ? (
          <>
            <View className="px-4 py-3 bg-gray-50">
              <Text className="text-gray-600 text-sm font-medium">
                CONTACTS ON IRACHAT ({filteredContacts.length})
              </Text>
            </View>
            
            {filteredContacts.map((contact, index) => renderContact(contact, index))}
          </>
        ) : (
          <View className="flex-1 items-center justify-center px-4">
            <Ionicons name="people-outline" size={64} color="#d1d5db" />
            <Text className="text-gray-500 text-lg font-medium mt-4">
              No contacts found
            </Text>
            <Text className="text-gray-400 text-center mt-2">
              Try searching with a different name
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Invite Friends Button */}
      <View className="px-4 py-3 bg-gray-50 border-t border-gray-200">
        <TouchableOpacity className="flex-row items-center justify-center bg-sky-500 rounded-full py-3">
          <Ionicons name="person-add" size={20} color="white" />
          <Text className="text-white font-semibold ml-2">Invite Friends to IraChat</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ContactsScreen;
