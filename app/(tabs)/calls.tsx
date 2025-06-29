// 📞 REAL CALLS TAB - Fully functional calling with WebRTC
// Real call history, contact integration, and actual calling functionality

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "../../src/redux/store";
import { realCallService, CallLog, CallType } from "../../src/services/realCallService";
import { contactService, IraChatContact } from "../../src/services/contactService";
import { formatCallTime, formatCallDuration } from "../../src/utils/dateUtils";

export default function CallsScreen() {
  const router = useRouter();
  const currentUser = useSelector((state: RootState) => state.user.currentUser);

  const [contacts, setContacts] = useState<IraChatContact[]>([]);
  const [callHistory, setCallHistory] = useState<CallLog[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<IraChatContact[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"contacts" | "history">("history");

  // Load data on component mount
  useEffect(() => {
    if (currentUser?.id) {
      loadCallHistory();
      loadContacts();
    }
  }, [currentUser?.id]);

  // Filter contacts based on search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredContacts(contacts);
    } else {
      const filtered = contacts.filter(contact =>
        contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.phoneNumber.includes(searchQuery)
      );
      setFilteredContacts(filtered);
    }
  }, [searchQuery, contacts]);

  // Load call history
  const loadCallHistory = useCallback(async () => {
    if (!currentUser?.id) return;
    
    try {
      setIsLoading(true);
      const history = await realCallService.getCallHistory(currentUser.id);
      setCallHistory(history);
      console.log('✅ Loaded call history:', history.length);
    } catch (error) {
      console.error('❌ Error loading call history:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser?.id]);

  // Load contacts
  const loadContacts = useCallback(async () => {
    if (!currentUser?.id) return;
    
    try {
      const userContacts = await contactService.getUserContacts(currentUser.id);
      setContacts(userContacts);
      setFilteredContacts(userContacts);
      console.log('✅ Loaded contacts:', userContacts.length);
    } catch (error) {
      console.error('❌ Error loading contacts:', error);
    }
  }, [currentUser?.id]);

  // Refresh data
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.all([loadCallHistory(), loadContacts()]);
    setIsRefreshing(false);
  }, [loadCallHistory, loadContacts]);

  // Handle voice call
  const handleVoiceCall = async (contact: IraChatContact) => {
    if (!currentUser?.id) return;
    
    try {
      console.log('📞 Starting voice call with:', contact.name);
      
      const result = await realCallService.startCall(
        currentUser.id,
        currentUser.name || 'Unknown',
        contact.userId || contact.id,
        contact.name,
        'voice'
      );
      
      if (result.success) {
        router.push({
          pathname: '/voice-call',
          params: {
            callId: result.callId,
            contactName: contact.name,
            contactAvatar: contact.avatar || '',
            isOutgoing: 'true',
          },
        });
      } else {
        Alert.alert('Call Failed', result.error || 'Unable to start call');
      }
    } catch (error) {
      console.error('❌ Error starting voice call:', error);
      Alert.alert('Call Failed', 'Unable to start call');
    }
  };

  // Handle video call
  const handleVideoCall = async (contact: IraChatContact) => {
    if (!currentUser?.id) return;
    
    try {
      console.log('📹 Starting video call with:', contact.name);
      
      const result = await realCallService.startCall(
        currentUser.id,
        currentUser.name || 'Unknown',
        contact.userId || contact.id,
        contact.name,
        'video'
      );
      
      if (result.success) {
        router.push({
          pathname: '/video-call',
          params: {
            callId: result.callId,
            contactName: contact.name,
            contactAvatar: contact.avatar || '',
            isOutgoing: 'true',
          },
        });
      } else {
        Alert.alert('Call Failed', result.error || 'Unable to start call');
      }
    } catch (error) {
      console.error('❌ Error starting video call:', error);
      Alert.alert('Call Failed', 'Unable to start call');
    }
  };

  // Render call history item - IRACHAT MODERN STYLE
  const renderCallHistoryItem = ({ item }: { item: CallLog }) => (
    <TouchableOpacity
      style={styles.modernCallItem}
      activeOpacity={0.7}
      onPress={() => {
        const contact = contacts.find(c => c.id === item.contactId);
        if (contact) {
          handleVoiceCall(contact);
        }
      }}
    >
      {/* Avatar with status indicator */}
      <View style={styles.modernAvatarContainer}>
        <TouchableOpacity onPress={() => {
          // Navigate to contact profile
          console.log('Navigate to profile:', item.contactName);
        }}>
          <Image
            source={{
              uri: item.contactAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.contactName)}&background=87CEEB&color=fff`
            }}
            style={styles.modernAvatar}
          />
        </TouchableOpacity>
        {/* Call type indicator */}
        <View style={[
          styles.callTypeIndicator,
          { backgroundColor: item.type === 'video' ? '#87CEEB' : '#87CEEB' }
        ]}>
          <Ionicons
            name={item.type === 'video' ? 'videocam' : 'call'}
            size={12}
            color="#FFFFFF"
          />
        </View>
      </View>

      {/* Call info - IraChat modern layout */}
      <View style={styles.modernCallInfo}>
        <View style={styles.modernCallHeader}>
          <TouchableOpacity onPress={() => {
            // Navigate to contact profile
            console.log('Navigate to profile:', item.contactName);
          }}>
            <Text style={styles.modernContactName}>{item.contactName}</Text>
          </TouchableOpacity>
          <Text style={styles.modernCallTime}>{formatCallTime(item.timestamp)}</Text>
        </View>

        <View style={styles.modernCallDetails}>
          <View style={styles.modernCallStatus}>
            <Ionicons
              name={
                item.direction === 'outgoing' ? 'arrow-up' :
                item.status === 'missed' ? 'arrow-down' : 'arrow-down'
              }
              size={14}
              color={
                item.status === 'missed' ? '#FF4444' :
                item.direction === 'outgoing' ? '#87CEEB' : '#87CEEB'
              }
              style={[
                styles.modernCallIcon,
                item.direction === 'outgoing' && { transform: [{ rotate: '45deg' }] },
                item.direction === 'incoming' && { transform: [{ rotate: '-45deg' }] }
              ]}
            />
            <Text style={[
              styles.modernCallStatusText,
              item.status === 'missed' && { color: '#FF4444' }
            ]}>
              {item.status === 'missed' ? 'Missed' :
               item.direction === 'outgoing' ? 'Outgoing' : 'Incoming'}
            </Text>
          </View>

          {item.duration && item.duration > 0 && (
            <Text style={styles.modernDuration}>
              {formatCallDuration(item.duration)}
            </Text>
          )}
        </View>
      </View>

      {/* Action buttons - IraChat modern style */}
      <View style={styles.modernCallActions}>
        <TouchableOpacity
          style={styles.modernCallButton}
          onPress={(e) => {
            e.stopPropagation();
            const contact = contacts.find(c => c.id === item.contactId);
            if (contact) {
              handleVoiceCall(contact);
            }
          }}
        >
          <Ionicons name="call" size={22} color="#87CEEB" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.modernVideoButton}
          onPress={(e) => {
            e.stopPropagation();
            const contact = contacts.find(c => c.id === item.contactId);
            if (contact) {
              handleVideoCall(contact);
            }
          }}
        >
          <Ionicons name="videocam" size={22} color="#87CEEB" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  // Render contact item
  const renderContactItem = ({ item }: { item: IraChatContact }) => (
    <TouchableOpacity style={styles.contactItem}>
      <Image
        source={{
          uri: item.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=667eea&color=fff`
        }}
        style={styles.avatar}
      />
      
      <View style={styles.contactInfo}>
        <Text style={styles.contactName}>{item.name}</Text>
        <Text style={styles.phoneNumber}>{item.phoneNumber}</Text>
        {item.isIraChatUser && (
          <Text style={styles.iraChatLabel}>IraChat User</Text>
        )}
      </View>
      
      <View style={styles.contactActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleVoiceCall(item)}
        >
          <Ionicons name="call" size={20} color="#667eea" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleVideoCall(item)}
        >
          <Ionicons name="videocam" size={20} color="#667eea" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons 
        name={activeTab === 'history' ? 'call-outline' : 'people-outline'} 
        size={64} 
        color="#E5E7EB" 
      />
      <Text style={styles.emptyTitle}>
        {activeTab === 'history' ? 'No Call History' : 'No Contacts'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {activeTab === 'history' 
          ? 'Your call history will appear here'
          : 'Add contacts to start making calls'
        }
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Calls</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={`Search ${activeTab === 'history' ? 'call history' : 'contacts'}...`}
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && styles.activeTab]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>
            Recent
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'contacts' && styles.activeTab]}
          onPress={() => setActiveTab('contacts')}
        >
          <Text style={[styles.tabText, activeTab === 'contacts' && styles.activeTabText]}>
            Contacts
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : (
        activeTab === 'history' ? (
          <FlatList<CallLog>
            data={callHistory}
            renderItem={renderCallHistoryItem}
            keyExtractor={(item) => item.id}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                colors={['#87CEEB']}
              />
            }
            ListEmptyComponent={renderEmptyState}
          />
        ) : (
          <FlatList<IraChatContact>
            data={filteredContacts}
            renderItem={renderContactItem}
            keyExtractor={(item) => item.id}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                colors={['#87CEEB']}
              />
            }
            ListEmptyComponent={renderEmptyState}
          />
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#374151',
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#667eea',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#667eea',
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
  list: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 8,
  },
  // IRACHAT MODERN CALL ITEMS
  modernCallItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 0.5,
    borderBottomColor: '#E1E5E9',
    marginHorizontal: 0,
  },
  modernAvatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  modernAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  callTypeIndicator: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  modernCallInfo: {
    flex: 1,
    marginRight: 12,
  },
  modernCallHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  modernContactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    flex: 1,
  },
  modernCallTime: {
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '400',
  },
  modernCallDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modernCallStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modernCallIcon: {
    marginRight: 4,
  },
  modernCallStatusText: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '400',
  },
  modernDuration: {
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '400',
  },
  modernCallActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modernCallButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  modernVideoButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  callItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  callInfo: {
    flex: 1,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  phoneNumber: {
    fontSize: 14,
    color: '#6B7280',
  },
  iraChatLabel: {
    fontSize: 12,
    color: '#667eea',
    fontWeight: '500',
    marginTop: 2,
  },
  callDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  callIcon: {
    marginRight: 4,
  },
  callTime: {
    fontSize: 14,
    color: '#6B7280',
  },
  callActions: {
    alignItems: 'flex-end',
  },
  contactActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  duration: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  callButton: {
    padding: 8,
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
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
});
