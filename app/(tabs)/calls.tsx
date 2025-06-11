import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
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

  // Load real contacts
  const loadRealContacts = async () => {
    try {
      setIsLoading(true);

      // Import contacts service
      const { contactsService } = await import('../../src/services/contactsService');

      // Get contacts
      const result = await contactsService.getContacts();

      // Transform contacts to match our Contact interface
      const transformedContacts: Contact[] = result.contacts.map((contact: any) => ({
        id: contact.id,
        name: contact.name,
        phoneNumber: contact.phoneNumber || contact.phoneNumbers?.[0] || '',
        avatar: contact.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(contact.name)}&background=667eea&color=fff`,
        isOnline: typeof contact.lastSeen === 'string' && contact.lastSeen === 'Online',
        lastSeen: contact.lastSeen || 'Unknown'
      }));

      setContacts(transformedContacts);
      setFilteredContacts(transformedContacts);
      console.log(`✅ Loaded ${transformedContacts.length} real contacts`);
    } catch (error) {
      console.error('❌ Error loading real contacts:', error);
      // Use fallback contacts
      setContacts(mockContacts);
      setFilteredContacts(mockContacts);
    } finally {
      setIsLoading(false);
    }
  };

  // Fallback contacts for demonstration
  const mockContacts: Contact[] = [
    {
      id: '1',
      name: 'John Doe',
      phoneNumber: '+256701234567',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      isOnline: true,
      lastSeen: 'Online'
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      phoneNumber: '+256701234568',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
      isOnline: false,
      lastSeen: '2 hours ago'
    },
    {
      id: '3',
      name: 'Mike Wilson',
      phoneNumber: '+256701234569',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      isOnline: true,
      lastSeen: 'Online'
    },
    {
      id: '4',
      name: 'Emily Davis',
      phoneNumber: '+256701234570',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      isOnline: false,
      lastSeen: '1 day ago'
    },
    {
      id: '5',
      name: 'David Brown',
      phoneNumber: '+256701234571',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      isOnline: true,
      lastSeen: 'Online'
    }
  ];

  // Sample call history
  const mockCallHistory: CallHistory[] = [
    {
      id: '1',
      contactId: '1',
      contactName: 'John Doe',
      contactAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      type: 'video',
      direction: 'outgoing',
      duration: '12:34',
      timestamp: '2 hours ago'
    },
    {
      id: '2',
      contactId: '2',
      contactName: 'Sarah Johnson',
      contactAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
      type: 'voice',
      direction: 'incoming',
      duration: '5:42',
      timestamp: '4 hours ago'
    },
    {
      id: '3',
      contactId: '3',
      contactName: 'Mike Wilson',
      contactAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      type: 'voice',
      direction: 'missed',
      duration: '',
      timestamp: '1 day ago'
    }
  ];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterContacts();
  }, [searchQuery, contacts]);

  const loadData = async () => {
    setIsLoading(true);

    // Load real contacts
    await loadRealContacts();

    // Load call history
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
      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#667eea" />
          <Text className="text-gray-500 mt-4">Loading contacts...</Text>
        </View>
      ) : activeTab === 'contacts' ? (
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
