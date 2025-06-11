import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    Image,
    RefreshControl,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

interface Contact {
  id: string;
  name: string;
  phoneNumber: string;
  avatar: string;
  isOnline: boolean;
  lastSeen?: string;
  isSelected?: boolean;
}

interface CallHistory {
  id: string;
  contactId: string;
  contactName: string;
  contactAvatar: string;
  type: 'voice' | 'video';
  direction: 'incoming' | 'outgoing' | 'missed';
  duration: string;
  timestamp: string;
}

export default function CallsScreen() {
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [callHistory, setCallHistory] = useState<CallHistory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);
  const [showCallModal, setShowCallModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'contacts' | 'history'>('contacts');
  const [isLoading, setIsLoading] = useState(true);

  // No mock data - contacts and call history will be loaded from Firebase only
  const mockContacts: Contact[] = [];
  const mockCallHistory: CallHistory[] = [];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterContacts();
  }, [searchQuery, contacts]);

  const loadData = () => {
    setIsLoading(true);
    setContacts(mockContacts);
    setCallHistory(mockCallHistory);
    setIsLoading(false);
  };

  const filterContacts = () => {
    if (searchQuery.trim() === '') {
      setFilteredContacts(contacts);
    } else {
      const filtered = contacts.filter(contact =>
        contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.phoneNumber.includes(searchQuery)
      );
      setFilteredContacts(filtered);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      loadData();
      setRefreshing(false);
    }, 1000);
  };

  const handleContactSelect = (contact: Contact) => {
    if (selectedContacts.length === 0) {
      // First contact selected
      setSelectedContacts([contact]);
    } else if (selectedContacts.length === 1) {
      // Second contact selected for group call
      if (selectedContacts[0].id !== contact.id) {
        setSelectedContacts([...selectedContacts, contact]);
      }
    } else {
      // Reset selection
      setSelectedContacts([contact]);
    }
  };

  const handleCall = (type: 'voice' | 'video') => {
    if (selectedContacts.length === 0) {
      Alert.alert('No Contact Selected', 'Please select a contact to call');
      return;
    }

    const callType = selectedContacts.length === 1 ? 'individual' : 'group';
    const contactNames = selectedContacts.map(c => c.name).join(', ');

    Alert.alert(
      `${type === 'voice' ? 'Voice' : 'Video'} Call`,
      `Start ${callType} ${type} call with ${contactNames}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call',
          onPress: () => {
            try {
              // Navigate to call screen with proper encoding
              const contactIds = selectedContacts.map(c => c.id).join(',');
              const encodedContacts = encodeURIComponent(contactIds);
              router.push(`/call?type=${type}&contacts=${encodedContacts}`);
              setSelectedContacts([]);
            } catch (error) {
              Alert.alert('Error', 'Failed to start call. Please try again.');
              console.error('Call navigation error:', error);
            }
          }
        }
      ]
    );
  };

  const renderContactItem = ({ item }: { item: Contact }) => {
    const isSelected = selectedContacts.some(c => c.id === item.id);
    
    return (
      <TouchableOpacity
        onPress={() => handleContactSelect(item)}
        className={`flex-row items-center px-4 py-3 ${isSelected ? 'bg-blue-50' : 'bg-white'}`}
        activeOpacity={0.7}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`${item.name}${isSelected ? ', selected' : ''}${item.isOnline ? ', online' : ''}`}
        accessibilityHint={`Tap to ${isSelected ? 'deselect' : 'select'} ${item.name} for calling`}
        accessibilityState={{ selected: isSelected }}
      >
        {/* Avatar */}
        <View className="relative">
          <Image
            source={{ uri: item.avatar }}
            className="w-12 h-12 rounded-full"
          />
          {item.isOnline && (
            <View className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white" style={{ backgroundColor: '#667eea' }} />
          )}
          {isSelected && (
            <View className="absolute -top-1 -right-1 w-6 h-6 rounded-full items-center justify-center" style={{ backgroundColor: '#667eea' }}>
              <Ionicons name="checkmark" size={14} color="white" />
            </View>
          )}
        </View>

        {/* Contact Info */}
        <View className="flex-1 ml-3">
          <Text
            className="text-gray-900 text-base"
            style={{ fontWeight: '600' }}
          >
            {item.name}
          </Text>
          <Text className="text-gray-500 text-sm">
            {item.isOnline ? 'Online' : item.lastSeen || item.phoneNumber}
          </Text>
        </View>

        {/* Call Buttons */}
        <View className="flex-row">
          <TouchableOpacity
            onPress={() => {
              try {
                setSelectedContacts([item]);
                setTimeout(() => handleCall('voice'), 100); // Small delay to ensure state update
              } catch (error) {
                Alert.alert('Error', 'Failed to initiate voice call');
              }
            }}
            className="p-3 mr-3 rounded-full"
            style={{ backgroundColor: '#F0F4FF' }}
            activeOpacity={0.7}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={`Voice call ${item.name}`}
            accessibilityHint="Tap to start a voice call"
          >
            <Ionicons name="call" size={20} color="#667eea" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              try {
                setSelectedContacts([item]);
                setTimeout(() => handleCall('video'), 100); // Small delay to ensure state update
              } catch (error) {
                Alert.alert('Error', 'Failed to initiate video call');
              }
            }}
            className="p-3 bg-blue-100 rounded-full"
            activeOpacity={0.7}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={`Video call ${item.name}`}
            accessibilityHint="Tap to start a video call"
          >
            <Ionicons name="videocam" size={20} color="#3B82F6" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderCallHistoryItem = ({ item }: { item: CallHistory }) => (
    <TouchableOpacity
      onPress={() => {
        const contact = contacts.find(c => c.id === item.contactId);
        if (contact) {
          setSelectedContacts([contact]);
          handleCall(item.type);
        }
      }}
      className="flex-row items-center px-4 py-3 bg-white"
    >
      <Image
        source={{ uri: item.contactAvatar }}
        className="w-12 h-12 rounded-full"
      />
      
      <View className="flex-1 ml-3">
        <Text
          className="text-gray-900 text-base"
          style={{ fontWeight: '600' }}
        >
          {item.contactName}
        </Text>
        <View className="flex-row items-center">
          <Ionicons
            name={
              item.direction === 'incoming' ? 'call-outline' :
              item.direction === 'outgoing' ? 'call' : 'call-outline'
            }
            size={16}
            color={item.direction === 'missed' ? '#EF4444' : '#667eea'}
          />
          <Text className={`text-sm ml-1 ${item.direction === 'missed' ? 'text-red-500' : 'text-gray-500'}`}>
            {item.direction === 'missed' ? 'Missed' : item.duration}
          </Text>
        </View>
      </View>

      <View className="items-end">
        <Text className="text-gray-400 text-xs">{item.timestamp}</Text>
        <Ionicons
          name={item.type === 'video' ? 'videocam' : 'call'}
          size={16}
          color="#9CA3AF"
          style={{ marginTop: 4 }}
        />
      </View>
    </TouchableOpacity>
  );

  return (
    <View
      className="flex-1 bg-gray-50"
      accessible={true}
      accessibilityLabel="Calls screen"
    >
      {/* Search Bar */}
      <View className="px-4 py-3 bg-white border-b border-gray-200">
        <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-2">
          <Ionicons
            name="search"
            size={20}
            color="#9CA3AF"
            accessible={true}
            accessibilityLabel="Search icon"
          />
          <TextInput
            placeholder="Search contacts..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="flex-1 ml-3 text-gray-700"
            placeholderTextColor="#9CA3AF"
            accessible={true}
            accessibilityLabel="Search contacts input"
            accessibilityHint="Type to search for contacts to call"
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

      {/* Tab Selector */}
      <View className="flex-row bg-white border-b border-gray-200">
        <TouchableOpacity
          onPress={() => setActiveTab('contacts')}
          className={`flex-1 py-3 items-center ${activeTab === 'contacts' ? 'border-b-2' : ''}`}
          style={activeTab === 'contacts' ? { borderBottomColor: '#667eea' } : {}}
          accessible={true}
          accessibilityRole="tab"
          accessibilityLabel="Contacts tab"
          accessibilityHint="View your contacts for calling"
          accessibilityState={{ selected: activeTab === 'contacts' }}
        >
          <Text
            className={activeTab === 'contacts' ? '' : 'text-gray-500'}
            style={{ fontWeight: '600', color: activeTab === 'contacts' ? '#667eea' : undefined }}
          >
            Contacts
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('history')}
          className={`flex-1 py-3 items-center ${activeTab === 'history' ? 'border-b-2' : ''}`}
          style={activeTab === 'history' ? { borderBottomColor: '#667eea' } : {}}
          accessible={true}
          accessibilityRole="tab"
          accessibilityLabel="Recent calls tab"
          accessibilityHint="View your recent call history"
          accessibilityState={{ selected: activeTab === 'history' }}
        >
          <Text
            className={activeTab === 'history' ? '' : 'text-gray-500'}
            style={{ fontWeight: '600', color: activeTab === 'history' ? '#667eea' : undefined }}
          >
            Recent
          </Text>
        </TouchableOpacity>
      </View>

      {/* Selected Contacts Bar */}
      {selectedContacts.length > 0 && (
        <View className="px-4 py-3 border-b" style={{ backgroundColor: '#F0F4FF', borderBottomColor: '#C7D2FE' }}>
          <View className="flex-row items-center justify-between">
            <Text
              style={{ fontWeight: '500', color: '#4338CA' }}
            >
              {selectedContacts.length} contact{selectedContacts.length > 1 ? 's' : ''} selected
            </Text>
            <View className="flex-row">
              <TouchableOpacity
                onPress={() => handleCall('voice')}
                className="px-4 py-2 rounded-full mr-2"
                style={{ backgroundColor: '#667eea' }}
              >
                <Text
                  className="text-white"
                  style={{ fontWeight: '600' }}
                >
                  Voice Call
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleCall('video')}
                className="px-4 py-2 rounded-full"
                style={{ backgroundColor: '#667eea' }}
              >
                <Text
                  className="text-white"
                  style={{ fontWeight: '600' }}
                >
                  Video Call
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Content */}
      {activeTab === 'contacts' ? (
        <FlatList
          data={filteredContacts}
          keyExtractor={(item) => item.id}
          renderItem={renderContactItem}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#667eea']}
              tintColor="#667eea"
            />
          }
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center px-8 py-16">
              <Ionicons name="people-outline" size={80} color="#9CA3AF" />
              <Text
                className="text-gray-500 text-lg mt-4 text-center"
                style={{ fontWeight: '500' }}
              >
                No contacts found
              </Text>
              <Text className="text-gray-400 text-sm text-center mt-2 leading-5">
                {searchQuery
                  ? `No contacts match "${searchQuery}"`
                  : 'Your contacts will appear here'
                }
              </Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={callHistory}
          keyExtractor={(item) => item.id}
          renderItem={renderCallHistoryItem}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#667eea']}
              tintColor="#667eea"
            />
          }
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center px-8 py-16">
              <Ionicons name="call-outline" size={80} color="#9CA3AF" />
              <Text
                className="text-gray-500 text-lg mt-4 text-center"
                style={{ fontWeight: '500' }}
              >
                No call history
              </Text>
              <Text className="text-gray-400 text-sm text-center mt-2 leading-5">
                Your call history will appear here
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}
