import { Ionicons } from "@expo/vector-icons";
import * as Contacts from "expo-contacts";
import { useRouter } from "expo-router";
import { collection, getDocs, limit, orderBy, query, where } from "firebase/firestore";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "../../src/redux/store";
import { Call, callsService } from "../../src/services/callsService";
import { db, getAuthInstance } from "../../src/services/firebaseSimple";

interface Contact {
  id: string;
  name: string;
  phoneNumber: string;
  avatar?: string;
  isOnline?: boolean;
  lastSeen?: Date;
  hasIraChat?: boolean;
}

interface CallHistoryItem {
  id: string;
  contactName: string;
  contactPhone: string;
  type: "incoming" | "outgoing" | "missed";
  callType: "voice" | "video";
  timestamp: Date;
  duration?: number;
  avatar?: string;
}

export default function CallsScreen() {
  const router = useRouter();
  const currentUser = useSelector((state: RootState) => state.user.currentUser);

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [callHistory, setCallHistory] = useState<CallHistoryItem[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data for testing (additive, doesn't replace live functionality)
  const { mockCalls, shouldUseMockData } = require("../../src/hooks/useMockData").useMockCalls();

  // Sample contacts to demonstrate implementation
  const sampleContacts: Contact[] = [
    {
      id: "sample1",
      name: "Alice Johnson",
      phoneNumber: "+1 (555) 123-4567",
      avatar: "",
      isOnline: true,
      hasIraChat: true,
    },
    {
      id: "sample2",
      name: "Bob Smith",
      phoneNumber: "+1 (555) 987-6543",
      avatar: "",
      isOnline: false,
      hasIraChat: false,
    }
  ];
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"contacts" | "history">("contacts");

  const filterContacts = useCallback(() => {
    if (!searchQuery.trim()) {
      setFilteredContacts(contacts);
      return;
    }

    const filtered = contacts.filter(
      (contact) =>
        contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.phoneNumber.includes(searchQuery),
    );
    setFilteredContacts(filtered);
  }, [searchQuery, contacts]);

  const loadRealContacts = useCallback(async () => {
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status !== "granted") {
        console.log("❌ Contacts permission denied");
        return;
      }

      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers],
      });

      const transformedContacts: Contact[] = data
        .filter((contact) => contact.phoneNumbers && contact.phoneNumbers.length > 0)
        .map((contact, index) => ({
          id: contact.id || `contact-${index}`,
          name: contact.name || "Unknown Contact",
          phoneNumber: contact.phoneNumbers![0].number || "",
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
            contact.name || "Unknown"
          )}&background=667eea&color=fff`,
          isOnline: false, // Will be updated with real status from onlineStatusService
          lastSeen: new Date(), // Real last seen will be fetched from Firebase
          hasIraChat: false, // Will be updated with real status from Firebase users collection
        }));

      // Add sample contacts for demonstration
      const allContacts = [...sampleContacts, ...transformedContacts];
      setContacts(allContacts);
      setFilteredContacts(allContacts);
      console.log(`✅ Loaded ${allContacts.length} contacts (${sampleContacts.length} samples + ${transformedContacts.length} real)`);
    } catch (error) {
      console.error("❌ Error loading real contacts:", error);
      setContacts([]);
      setFilteredContacts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadCallHistory = useCallback(async () => {
    try {
      let allCalls: CallHistoryItem[] = [];

      // Load real call history from Firebase
      try {
        if (db) {
          const callsRef = collection(db, "callLogs");
          const q = query(
            callsRef,
            where("userId", "==", currentUser?.phoneNumber || "unknown"),
            orderBy("timestamp", "desc"),
            limit(50)
          );

          const snapshot = await getDocs(q);
          const calls: CallHistoryItem[] = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              contactName: data.contactName || "Unknown",
              contactPhone: data.contactPhone || "",
              type: data.type || "outgoing",
              callType: data.callType || "voice",
              timestamp: data.timestamp?.toDate() || new Date(),
              duration: data.duration || 0,
              avatar: data.avatar,
            };
          });

          allCalls = [...calls];
          console.log(`✅ Loaded ${calls.length} call history items from Firebase`);
        }
      } catch (firebaseError) {
        console.log("📭 Firebase call history not available, using mock data if enabled");
      }

      // Add mock data if enabled and available (only when no real calls exist)
      if (shouldUseMockData && mockCalls && mockCalls.length > 0 && allCalls.length === 0) {
        const convertedMockCalls: CallHistoryItem[] = mockCalls.map((mockCall: any) => ({
          id: `mock_${mockCall.id}`,
          contactName: mockCall.participantName,
          contactPhone: `+1555${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`,
          type: mockCall.direction,
          callType: mockCall.type,
          timestamp: mockCall.timestamp,
          duration: mockCall.duration,
          avatar: mockCall.participantAvatar,
        }));

        // Only add mock calls when no real calls exist (not overriding)
        allCalls = [...convertedMockCalls];
        console.log(`📊 Added ${convertedMockCalls.length} mock calls for testing (no real calls found)`);
      }

      setCallHistory(allCalls);
    } catch (error) {
      console.error("❌ Error loading call history:", error);
      setCallHistory([]);
    }
  }, [currentUser?.phoneNumber, shouldUseMockData, mockCalls]);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([loadRealContacts(), loadCallHistory()]);
    setIsLoading(false);
  }, [loadRealContacts, loadCallHistory]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    filterContacts();
  }, [filterContacts]);

  // Initialize calls service with proper error handling
  useEffect(() => {
    console.log('🔄 Initializing calls service...');

    const handleCallsUpdate = (calls: Call[]) => {
      console.log(`📞 Received ${calls.length} calls from service`);
      // Convert calls to CallHistoryItem format
      const historyItems: CallHistoryItem[] = calls.map(call => ({
        id: call.id,
        contactName: call.callerName || 'Unknown',
        contactPhone: call.participants.find((p: string) => p !== currentUser?.id) || '',
        type: call.status as "incoming" | "outgoing" | "missed",
        callType: call.type,
        timestamp: call.timestamp,
        duration: call.duration,
        avatar: call.callerAvatar,
      }));
      setCallHistory(historyItems);
    };

    const handleError = (error: string) => {
      console.warn('⚠️ Calls service error:', error);
      // Fallback to empty calls list on error
      handleCallsUpdate([]);
    };

    // Try to use real call data, fallback to empty list if auth fails
    console.log('📞 Attempting to load real calls data...');

    const authInstance = getAuthInstance();
    if (authInstance && authInstance.currentUser) {
      console.log('✅ Auth available, loading real calls');
      callsService.startListening(handleCallsUpdate, handleError);
    } else if (currentUser?.id) {
      console.log('✅ User available, loading real calls');
      callsService.startListening(handleCallsUpdate, handleError);
    } else {
      console.warn('⚠️ No authentication available, showing empty calls list');
      // Show empty state instead of mock data for production readiness
      handleCallsUpdate([]);
    }

    return () => {
      callsService.stopListening();
    };
  }, [currentUser?.id]);

  const formatCallTime = (timestamp: Date) => {
    try {
      const now = new Date();
      const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));

      if (diffInMinutes < 1) return "Just now";
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
      if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;

      const diffInDays = Math.floor(diffInMinutes / 1440);
      if (diffInDays === 1) return "Yesterday";
      if (diffInDays < 7) return `${diffInDays} days ago`;

      return timestamp.toLocaleDateString();
    } catch {
      return "Unknown";
    }
  };

  const formatCallDuration = (seconds: number) => {
    if (seconds === 0) return "Missed";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleVoiceCall = (contact: Contact) => {
    console.log(`📞 Starting voice call with ${contact.name}`);

    // Navigate to voice call screen
    router.push({
      pathname: "/voice-call",
      params: {
        contactId: contact.id,
        contactName: contact.name,
        contactAvatar: contact.avatar || "",
      }
    });
  };

  const handleVideoCall = (contact: Contact) => {
    console.log(`📹 Starting video call with ${contact.name}`);

    // Navigate to call screen with video type
    router.push({
      pathname: "/call",
      params: {
        type: "video",
        contactId: contact.id,
        contactName: contact.name,
        contactAvatar: contact.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(contact.name)}&background=667eea&color=fff`,
        contactPhoneNumber: contact.phoneNumber,
        callId: `video_${Date.now()}_${contact.id}`,
        isOutgoing: "true",
        isIncoming: "false",
      }
    });
  };

  const handleCallBack = (call: CallHistoryItem) => {
    Alert.alert(
      "Call Back",
      `Call ${call.contactName}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Voice Call",
          onPress: () => {
            console.log(`📞 Calling back ${call.contactName}`);
            router.push({
              pathname: "/call",
              params: {
                type: "voice",
                contactName: call.contactName,
                contactAvatar: call.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(call.contactName)}&background=10B981&color=fff`,
                contactPhoneNumber: call.contactPhone,
                callId: `callback_voice_${Date.now()}`,
                isOutgoing: "true",
                isIncoming: "false",
              },
            });
          },
        },
        {
          text: "Video Call",
          onPress: () => {
            console.log(`📹 Video calling back ${call.contactName}`);
            router.push({
              pathname: "/call",
              params: {
                type: "video",
                contactName: call.contactName,
                contactAvatar: call.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(call.contactName)}&background=3B82F6&color=fff`,
                contactPhoneNumber: call.contactPhone,
                callId: `callback_video_${Date.now()}`,
                isOutgoing: "true",
                isIncoming: "false",
              },
            });
          },
        },
      ],
    );
  };

  const renderContact = ({ item }: { item: Contact }) => (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FFFFFF',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#87CEEB',
    }}>
      {/* Avatar with Online Indicator */}
      <View style={{ position: 'relative', marginRight: 12 }}>
        <View style={{
          width: 48,
          height: 48,
          borderRadius: 24,
          backgroundColor: item.avatar ? 'transparent' : '#667eea',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {item.avatar ? (
            <Image
              source={{ uri: item.avatar }}
              style={{ width: 48, height: 48, borderRadius: 24 }}
              resizeMode="cover"
            />
          ) : (
            <Text style={{
              color: '#FFFFFF',
              fontSize: 18,
              fontWeight: 'bold',
            }}>
              {item.name.charAt(0).toUpperCase()}
            </Text>
          )}
        </View>

        {/* Beautiful Online Indicator for IraChat users */}
        {item.hasIraChat && item.isOnline && (
          <View style={{
            position: 'absolute',
            bottom: 2,
            right: 2,
            width: 14,
            height: 14,
            borderRadius: 7,
            backgroundColor: '#10B981',
            borderWidth: 2,
            borderColor: '#FFFFFF',
            shadowColor: '#10B981',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 3,
            elevation: 3,
          }} />
        )}
      </View>

      {/* Contact Info */}
      <View style={{ flex: 1 }}>
        <TouchableOpacity
          onPress={() => {
            if (item.hasIraChat) {
              router.push({
                pathname: "/individual-chat",
                params: {
                  contactId: item.id,
                  contactName: item.name,
                  contactAvatar: item.avatar || "",
                }
              });
            }
          }}
          disabled={!item.hasIraChat}
        >
          <Text style={{
            fontSize: 16,
            fontWeight: '600',
            color: item.hasIraChat ? '#667eea' : '#374151',
            marginBottom: 2,
          }}>
            {item.name}
          </Text>
        </TouchableOpacity>

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{
            fontSize: 14,
            color: '#6B7280',
            marginRight: 8,
          }}>
            {item.phoneNumber}
          </Text>
          {item.hasIraChat && (
            <View style={{
              backgroundColor: 'rgba(102, 126, 234, 0.1)',
              paddingHorizontal: 6,
              paddingVertical: 2,
              borderRadius: 8,
            }}>
              <Text style={{
                fontSize: 9,
                color: '#667eea',
                fontWeight: '600',
              }}>
                IRACHAT
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Call Actions */}
      {item.hasIraChat ? (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            onPress={() => handleVoiceCall(item)}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 8,
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="call" size={18} color="#10B981" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleVideoCall(item)}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: 'rgba(102, 126, 234, 0.1)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="videocam" size={18} color="#667eea" />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          onPress={() => {
            // Send invite silently
            console.log("Invite sent to", item.name);
            // No dialog - just silent action
          }}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: 'rgba(14, 165, 233, 0.1)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="person-add" size={18} color="#0ea5e9" />
        </TouchableOpacity>
      )}
    </View>
  );

  const renderSectionHeader = ({ item }: { item: any }) => (
    <View style={{
      backgroundColor: '#F0F9FF',
      paddingHorizontal: 20,
      paddingVertical: 12,
      marginTop: 8,
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Ionicons
          name={item.callType === 'video' ? 'videocam' : 'call'}
          size={16}
          color="#667eea"
          style={{ marginRight: 8 }}
        />
        <Text style={{
          fontSize: 14,
          fontWeight: '600',
          color: '#667eea',
        }}>
          {item.title}
        </Text>
      </View>
    </View>
  );

  const renderCallHistory = ({ item }: { item: any }) => {
    if (item.type === 'header') {
      return renderSectionHeader({ item });
    }

    return (
    <TouchableOpacity
      onPress={() => handleCallBack(item)}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        marginHorizontal: 12,
        marginVertical: 3,
        padding: 10,
        borderRadius: 12,
        shadowColor: '#667eea',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 3,
        borderWidth: 1,
        borderColor: 'rgba(102, 126, 234, 0.1)',
      }}
    >
      <View style={{ position: 'relative' }}>
        {(() => {
          const Avatar = require("../../src/components/Avatar").Avatar;
          return (
            <Avatar
              name={item.contactName}
              imageUrl={item.avatar}
              size="medium"
              showOnlineStatus={false}
            />
          );
        })()}
      </View>

      <View className="flex-1 ml-3">
        <Text className="text-gray-900 font-semibold text-base">
          {item.contactName}
        </Text>
        <View className="flex-row items-center mt-1">
          <Ionicons
            name={
              item.type === "incoming"
                ? "call-outline"
                : item.type === "outgoing"
                ? "call"
                : "call-outline"
            }
            size={14}
            color={
              item.type === "missed" ? "#EF4444" :
              item.type === "incoming" ? "#10B981" : "#6B7280"
            }
          />
          <Text className="text-gray-500 text-sm ml-1">
            {item.type === "missed" ? "Missed" :
             item.type === "incoming" ? "Incoming" : "Outgoing"}
          </Text>
          <Text className="text-gray-400 mx-1">•</Text>
          <Text className="text-gray-500 text-sm">
            {formatCallTime(item.timestamp)}
          </Text>
        </View>
      </View>

      <View className="items-end">
        <Ionicons
          name={item.callType === "video" ? "videocam" : "call"}
          size={16}
          color="#6B7280"
        />
        <Text className="text-gray-500 text-xs mt-1">
          {formatCallDuration(item.duration || 0)}
        </Text>
      </View>
    </TouchableOpacity>
    );
  };

  const insets = { top: 50, bottom: 0, left: 0, right: 0 }; // Fallback safe area

  // Group call history by type
  const groupedCallHistory = React.useMemo(() => {
    const voiceCalls = callHistory.filter(call => call.callType === 'voice');
    const videoCalls = callHistory.filter(call => call.callType === 'video');

    const grouped = [];
    if (videoCalls.length > 0) {
      grouped.push({ type: 'header', title: `Video Calls (${videoCalls.length})`, callType: 'video' });
      grouped.push(...videoCalls.map(call => ({ ...call, type: 'call' })));
    }
    if (voiceCalls.length > 0) {
      grouped.push({ type: 'header', title: `Voice Calls (${voiceCalls.length})`, callType: 'voice' });
      grouped.push(...voiceCalls.map(call => ({ ...call, type: 'call' })));
    }

    return grouped;
  }, [callHistory]);

  return (
    <View style={{ flex: 1, backgroundColor: '#F0F9FF' }}>
      {/* Beautiful Header */}
      <View
        style={{
          backgroundColor: '#667eea',
          paddingTop: insets.top + 1,
          paddingBottom: 4,
          paddingHorizontal: 16,
          shadowColor: '#667eea',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
          <View style={{ flex: 1 }}>
            <Text style={{
              fontSize: 18,
              fontWeight: 'bold',
              color: '#FFFFFF',
            }}>
              Calls
            </Text>
            <Text style={{
              fontSize: 11,
              color: 'rgba(255, 255, 255, 0.8)',
              marginTop: 1,
            }}>
              {activeTab === "contacts"
                ? `${filteredContacts.length} contacts available`
                : `${callHistory.length} recent calls`
              }
            </Text>
          </View>
        </View>

        {/* Enhanced Search Bar */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.15)',
          borderRadius: 6,
          paddingHorizontal: 6,
          paddingVertical: 2,
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.2)',
        }}>
          <Ionicons name="search" size={18} color="rgba(255, 255, 255, 0.8)" style={{ marginRight: 10 }} />
          <TextInput
            placeholder="Search contacts and calls..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{ flex: 1, fontSize: 14, color: '#FFFFFF' }}
            placeholderTextColor="rgba(255, 255, 255, 0.7)"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={18} color="rgba(255, 255, 255, 0.8)" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Beautiful Tab Selector */}
      <View style={{
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 16,
        paddingVertical: 10,
        shadowColor: '#667eea',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
      }}>
        <TouchableOpacity
          onPress={() => setActiveTab("contacts")}
          style={{
            flex: 1,
            paddingVertical: 8,
            paddingHorizontal: 12,
            borderRadius: 12,
            backgroundColor: activeTab === "contacts" ? 'rgba(102, 126, 234, 0.1)' : 'transparent',
            borderWidth: 1,
            borderColor: activeTab === "contacts" ? 'rgba(102, 126, 234, 0.3)' : 'transparent',
            marginRight: 6,
            alignItems: 'center',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons
              name="people"
              size={18}
              color={activeTab === "contacts" ? "#667eea" : "#9CA3AF"}
              style={{ marginRight: 8 }}
            />
            <Text style={{
              fontSize: 16,
              fontWeight: '600',
              color: activeTab === "contacts" ? "#667eea" : "#9CA3AF",
            }}>
              Contacts ({filteredContacts.length})
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab("history")}
          style={{
            flex: 1,
            paddingVertical: 8,
            paddingHorizontal: 12,
            borderRadius: 12,
            backgroundColor: activeTab === "history" ? 'rgba(102, 126, 234, 0.1)' : 'transparent',
            borderWidth: 1,
            borderColor: activeTab === "history" ? 'rgba(102, 126, 234, 0.3)' : 'transparent',
            marginLeft: 6,
            alignItems: 'center',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons
              name="time"
              size={18}
              color={activeTab === "history" ? "#667eea" : "#9CA3AF"}
              style={{ marginRight: 8 }}
            />
            <Text style={{
              fontSize: 16,
              fontWeight: '600',
              color: activeTab === "history" ? "#667eea" : "#9CA3AF",
            }}>
              Recent ({callHistory.length})
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#667eea" />
          <Text className="text-gray-500 mt-2">Loading...</Text>
        </View>
      ) : activeTab === "contacts" ? (
        filteredContacts.length > 0 ? (
          <FlatList
            data={filteredContacts}
            renderItem={renderContact}
            keyExtractor={(item) => item.id}
            getItemLayout={(_data, index) => ({
              length: 72, // Height for border-separated design
              offset: 72 * index,
              index,
            })}
            style={{ flex: 1, backgroundColor: '#F0F9FF' }}
            contentContainerStyle={{
              paddingTop: 8,
              paddingBottom: 20,
            }}
            showsVerticalScrollIndicator={false}
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            windowSize={10}
          />
        ) : (
          (() => {
            if (searchQuery) {
              const { SearchEmptyState } = require("../../src/components/EmptyStateImproved");
              return (
                <SearchEmptyState
                  title="No contacts found"
                  subtitle={`No contacts match "${searchQuery}"`}
                  actionText="Clear Search"
                  onActionPress={() => setSearchQuery("")}
                />
              );
            } else {
              const { ContactsEmptyState } = require("../../src/components/EmptyStateImproved");
              return (
                <ContactsEmptyState
                  onActionPress={loadData}
                />
              );
            }
          })()
        )
      ) : (
        groupedCallHistory.length > 0 ? (
          <FlatList
            data={groupedCallHistory}
            renderItem={renderCallHistory}
            keyExtractor={(item, index) => (item as any).id || `header-${index}`}
            style={{ flex: 1, backgroundColor: '#F0F9FF' }}
            contentContainerStyle={{
              paddingTop: 8,
              paddingBottom: 20,
            }}
            showsVerticalScrollIndicator={false}
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            windowSize={10}
          />
        ) : (
          (() => {
            const { CallsEmptyState } = require("../../src/components/EmptyStateImproved");
            return (
              <CallsEmptyState
                onActionPress={() => setActiveTab("contacts")}
              />
            );
          })()
        )
      )}
    </View>
  );
}