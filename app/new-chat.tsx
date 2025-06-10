import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Alert, Text, Image, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../src/services/firebaseSimple';
import { useRouter } from 'expo-router';
import { Contact, getIraChatContacts, searchContacts } from '../src/services/contactsService';
import ContactItem from '../src/components/ContactItem';
import { Ionicons } from '@expo/vector-icons';

export default function NewChatScreen() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [creating, setCreating] = useState(false);
  const router = useRouter();

  // Load contacts on component mount
  useEffect(() => {
    loadContacts();
  }, []);

  // Filter contacts based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredContacts(contacts);
    } else {
      const filtered = contacts.filter(contact =>
        contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.phoneNumber.includes(searchQuery)
      );
      setFilteredContacts(filtered);
    }
  }, [searchQuery, contacts]);

  const loadContacts = async () => {
    try {
      setLoading(true);
      const iraChatContacts = await getIraChatContacts();
      setContacts(iraChatContacts);
      setFilteredContacts(iraChatContacts);
    } catch (error) {
      console.error('Error loading contacts:', error);
      Alert.alert('Error', 'Failed to load contacts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadContacts();
    setRefreshing(false);
  };

  const createChatWithContact = async (contact: Contact) => {
    setCreating(true);
    try {
      // Create a new chat with the selected contact
      const chatDoc = await addDoc(collection(db, 'chats'), {
        name: contact.name,
        isGroup: false,
        participants: [contact.phoneNumber], // Add contact's phone number
        lastMessage: '',
        lastMessageAt: serverTimestamp(),
        timestamp: serverTimestamp(),
        contactInfo: {
          id: contact.id,
          name: contact.name,
          phoneNumber: contact.phoneNumber,
          avatar: contact.avatar,
          username: contact.username,
          status: contact.status,
          bio: contact.bio,
        }
      });

      console.log('✅ Chat created successfully:', chatDoc.id);

      // Navigate to the new chat with contact name
      router.replace(`/chat/${chatDoc.id}?name=${encodeURIComponent(contact.name)}&contactId=${contact.id}`);
    } catch (error) {
      console.error('❌ Error creating chat:', error);
      Alert.alert('Error', 'Failed to start conversation. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const renderContactItem = ({ item }: { item: Contact }) => (
    <ContactItem
      contact={item}
      onPress={createChatWithContact}
    />
  );

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center px-6">
      <View
        className="w-24 h-24 rounded-full items-center justify-center mb-6"
        style={{
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          borderWidth: 2,
          borderColor: 'rgba(102, 126, 234, 0.2)',
        }}
      >
        <Ionicons
          name={searchQuery ? "search" : "people-outline"}
          size={40}
          color="#667eea"
        />
      </View>
      <Text
        className="text-gray-500 text-lg mb-2"
        style={{ fontWeight: '500' }}
      >
        {searchQuery ? 'No contacts found' : 'No IraChat contacts yet'}
      </Text>
      <Text className="text-gray-400 text-center leading-5">
        {searchQuery
          ? 'Try searching with a different name or phone number'
          : 'Your friends who use IraChat will appear here when they join'
        }
      </Text>

      {!searchQuery && (
        <TouchableOpacity
          onPress={() => Alert.alert('Invite Friends', 'Share IraChat with your friends to start chatting!')}
          className="mt-6 px-6 py-3 rounded-full"
          style={{ backgroundColor: '#667eea' }}
        >
          <Text className="text-white font-medium">Invite Friends</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="px-4 py-4 border-b border-gray-200">
        <Text
          className="text-xl text-gray-800 mb-3"
          style={{ fontWeight: '700' }}
        >
          Select Contact
        </Text>

        {/* Search Bar */}
        <View className="flex-row items-center bg-gray-100 rounded-lg px-3 py-2">
          <Ionicons name="search" size={20} color="#6B7280" style={{ marginRight: 12 }} />
          <TextInput
            placeholder="Search by name, username, or phone..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="flex-1 text-base"
            placeholderTextColor="#9CA3AF"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Contacts List */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#667eea" />
          <Text className="text-gray-500 mt-2">Finding your contacts...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredContacts}
          renderItem={renderContactItem}
          keyExtractor={(item) => item.id}
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
        />
      )}

      {/* Group Chat Option */}
      <View className="px-4 py-3 border-t border-gray-200">
        <TouchableOpacity
          onPress={() => router.push('/create-group')}
          disabled={creating}
          className="flex-row items-center py-3"
        >
          <View className="w-12 h-12 rounded-full items-center justify-center mr-3" style={{ backgroundColor: '#667eea' }}>
            <Ionicons name="people" size={20} color="white" />
          </View>
          <Text
            className="text-base"
            style={{ fontWeight: '600', color: '#667eea' }}
          >
            Create Group Chat
          </Text>
        </TouchableOpacity>
      </View>

      {/* Loading overlay for chat creation */}
      {creating && (
        <View className="absolute inset-0 bg-black bg-opacity-50 items-center justify-center">
          <View className="bg-white rounded-lg p-6 items-center">
            <ActivityIndicator size="large" color="#667eea" />
            <Text className="text-gray-700 mt-2">Starting conversation...</Text>
          </View>
        </View>
      )}
    </View>
  );
}
